const config = require('../config/envconfig');
const tanStore = require('../stores/tan_store');
const naytradingStore = require('../stores/naytrading_store');
const brokerStore = require('../stores/broker_store');
const browser = require('../clients/browser');
const broker = require('../clients/broker');
const naytradingClient = require('../clients/naytrading_client');
const FatalError = require('../clients/errors').FatalError;
const CancelOrderFatalError = require('../clients/errors').CancelOrderFatalError;
const CancelOrderTemporaryError = require('../clients/errors').CancelOrderTemporaryError;
const TanError = require('../clients/errors').TanError;

exports.lastRun = new Date();
exports.isRunning = false;
exports.isSuspended = false;
exports.cancel = false;
exports.log = "";

async function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

function writeToLog(message) {
    exports.log = message + "\n" + exports.log;
    if (exports.log.length > config.max_log_length) {
        exports.log = exports.log.substr(0, config.max_log_length);
    }
}

class Logger {
    constructor(user, suggestionId) {
        this.History = "";
        this.user = user;
        this.suggestionId = suggestionId;
    }

    log(message) {
        if (this.History.length) {
            this.History += "\n";
        }

        this.History += message;

        writeToLog("User " + this.user + " and suggestion " + this.suggestionId + ": " + message);
    }
}

async function prepareBuy(driver, suggestion, log, logger, availableFunds) {
    log.Action = broker.getActionBuy(config.broker_name);

    if (availableFunds - config.order_fee < config.min_buy_order_price) {
        throw new CancelOrderTemporaryError("Insufficient funds to buy anything: " + availableFunds + " EUR");
    }

    const ownedQuantity = await broker.getOwnedQuantity(config.broker_name, driver, suggestion.Isin, suggestion.Wkn);
    if (ownedQuantity > 0) {
        throw new CancelOrderFatalError("Already owning " + ownedQuantity + " stocks of this company");
    }

    logger.log("Available funds: " + availableFunds + " EUR");

    const currentPrice = await broker.getPrice(config.broker_name, driver, suggestion.Isin || suggestion.Wkn, log.Action);
    log.Price = currentPrice;
    if (currentPrice > suggestion.Price) {
        throw new CancelOrderTemporaryError("Too expensive to buy at " + currentPrice + ". Expected price to be " + suggestion.Price + " EUR or less");
    }

    const upperLimit = Math.min(availableFunds - config.order_fee, config.max_buy_order_price);
    logger.log("Desired buy order total: " + upperLimit + " EUR (+fee)");

    log.Quantity = Math.floor(upperLimit / currentPrice);
    logger.log("Calculated quantity to buy: " + log.Quantity + " at " + currentPrice + " EUR each");

    const total = log.Quantity * currentPrice;
    logger.log("Calculated buy order total: " + total + " EUR (+fee)");

    if (total < config.min_buy_order_price) {
        throw new CancelOrderTemporaryError("Buy order total is too low");
    }

    if (log.Quantity <= 0) {
        throw new CancelOrderFatalError("Invalid quantity: " + log.Quantity);
    }
}

async function prepareSell(driver, suggestion, log, logger) {
    log.Action = broker.getActionSell(config.broker_name);

    log.Quantity = await broker.getOwnedQuantity(config.broker_name, driver, suggestion.Isin, suggestion.Wkn);
    if (log.Quantity == 0) {
        throw new CancelOrderFatalError("Portfolio does not contain any shares of the instrument");
    }

    const currentPrice = await broker.getPrice(config.broker_name, driver, suggestion.Isin || suggestion.Wkn, log.Action);
    if (currentPrice < suggestion.Price) {
        throw new CancelOrderTemporaryError("Too cheap to sell at " + currentPrice + ". Expected price to be " + suggestion.Price + " EUR or more");
    }

    if (log.Quantity <= 0) {
        throw new CancelOrderFatalError("Invalid quantity: " + log.Quantity);
    }
}

async function processSuggestion(driver, user, suggestion, availableFunds, jwt) {
    const log = {
        Snapshot_ID: suggestion.ID,
        Status: "Processing",
        Time: new Date()
    };
    try {
        log.ID = await naytradingClient.saveTradeLog(log, jwt);
    }
    catch (error) {
        throw new CancelOrderTemporaryError("Could not set processing status: " + error.message);
    }

    const logger = new Logger(user, suggestion.ID);
    try {
        logger.log("Processing suggestion " + suggestion.ID + ": " + suggestion.Action + " " + suggestion.InstrumentName + " for " + suggestion.Price);

        const isinOrWkn = suggestion.Isin || suggestion.Wkn;
        if (!isinOrWkn || !isinOrWkn.length) {
            throw new CancelOrderFatalError("ISIN or WKN not found for suggestion " + suggestion.ID);
        }

        const hasNewerSuggestion = await naytradingClient.hasNewerSuggestion(suggestion.ID, jwt);
        if (hasNewerSuggestion) {
            throw new CancelOrderFatalError("There is a newer suggestion for the same instrument");
        }

        if (suggestion.Action == "buy") {
            await prepareBuy(driver, suggestion, log, logger, availableFunds);
        }
        else if (suggestion.Action == "sell") {
            await prepareSell(driver, suggestion, log, logger);
        }
        else {
            throw new CancelOrderFatalError("Trading action " + suggestion.Action + " is unknown");
        }

        if (exports.cancel) {
            throw new CancelOrderTemporaryError("Processing was cancelled by the admin.");
        }

        await sleep(2000 + Math.random() * 1000);
        logger.log("Getting TAN challenge...");
        const tanChallenge = await broker.getTanChallenge(config.broker_name, driver, log.Quantity, log.Action);
        logger.log("TAN challenge: " + JSON.stringify(tanChallenge));

        const tan = await tanStore.getTan(user, tanChallenge);

        await sleep(2000 + Math.random() * 1000);

        if (exports.cancel) {
            throw new CancelOrderTemporaryError("Processing was cancelled by the admin.");
        }

        logger.log("Getting offer...");
        let offer;
        try {
            offer = await broker.getQuote(config.broker_name, driver, tan);
            logger.log("Offer: " + offer + " EUR");
        }
        catch (error) {
            if (error instanceof TanError) {
                await tanStore.setTanList(user, undefined);
                throw new CancelOrderTemporaryError(error.message);
            }
            throw error;
        }

        if (log.Action == broker.getActionBuy(config.broker_name) && offer > suggestion.Price) {
            throw new CancelOrderTemporaryError("Too expensive to buy. Expected price to be " + suggestion.Price + " EUR or less");
        }

        if (log.Action == broker.getActionSell(config.broker_name) && offer < suggestion.Price) {
            throw new CancelOrderTemporaryError("Too cheap to sell. Expected price to be " + suggestion.Price + " EUR or more");
        }

        if (exports.cancel) {
            throw new CancelOrderTemporaryError("Processing was cancelled by the admin.");
        }

        await broker.placeOrder(config.broker_name, driver);

        log.Status = "Complete";
        logger.log("Suggestion is processed completely");

        if (log.Action == broker.getActionBuy(config.broker_name)) {
            logger.log("Calculating available funds");
            availableFunds -= log.Quantity * suggestion.Price;
            availableFunds -= config.order_fee;

            logger.log("Notifying naytrading...");
            await naytradingClient.setInstrumentWeight(suggestion.Isin || suggestion.Wkn, "Trader-bought", 1, jwt);
            logger.log("Naytrading was notified.");
        }
        else if (log.Action == broker.getActionSell(config.broker_name)) {
            logger.log("Calculating available funds");
            availableFunds += log.Quantity * suggestion.Price;
            availableFunds -= 0.25 * log.Quantity * suggestion.Price;
            availableFunds -= config.order_fee;

            logger.log("Notifying naytrading...");
            await naytradingClient.setInstrumentWeight(suggestion.Isin || suggestion.Wkn, "Trader-bought", 0, jwt);
            logger.log("Naytrading was notified.");
        }
    }
    catch (e) {
        if (log.Status == "Complete") {
            logger.log("Error after processing suggestion " + suggestion.ID + " was already complete: " + e.message + "\n" + e.stack);
            logger.log("Suggestion is processed completely");
        }
        else if (e instanceof CancelOrderTemporaryError) {
            log.Status = "TemporaryError";
            logger.log(e.message);
            logger.log("Suggestion may be processed again");
        }
        else if (e instanceof CancelOrderFatalError) {
            log.Status = "FatalError";
            logger.log("FATAL: " + e.message);
            logger.log("Suggestion will not be processed again");
        }
        else {
            log.Status = "TemporaryError";
            logger.log("Unexpected error: " + e.message + "\n" + e.stack);
            logger.log("Suggestion may be processed again");
        }
    }
    finally {
        log.Message = logger.History;
        try {
            await naytradingClient.saveTradeLog(log, jwt);
        }
        catch (error) {
            logger.log("Could not set processing status: " + error.message);
            log.Message = logger.History;
        }
    }

    return availableFunds;
}

async function processSuggestions(user) {
    if (naytradingStore.isPasswordSet(user)) {

        let jwt = null;
        try {
            writeToLog("Logging in at naytrading with user " + user + "...");
            jwt = await naytradingStore.login(async (password) => await naytradingClient.login(user, password), user);
            writeToLog("Logged in at naytrading.");
        }
        catch (e) {
            writeToLog("Login failed at naytrading: " + e.message);
            naytradingStore.setPassword(user, null);
            throw e;
        }

        let suggestions = [];
        try {
            writeToLog("Loading suggestions from naytrading for user " + user + "...");
            suggestions = await naytradingClient.getOpenSuggestions(jwt);
            writeToLog("Received " + suggestions.length + " suggestions.");
        }
        catch (e) {
            writeToLog("Could not get suggestions from naytrading: " + e.message);
            throw e;
        }

        if (suggestions && suggestions.length) {

            if (brokerStore.isBrokerUserSet(user)) {

                if (brokerStore.isPasswordSet(user)) {

                    if (tanStore.isTanListSet(user)) {

                        writeToLog("Starting browser for user " + user + "...");
                        const driver = await browser.createDriver();
                        writeToLog("Browser started.");

                        try {
                            try {
                                writeToLog("Logging in at broker with user " + user + "...");
                                await brokerStore.login(async (u, p) => await broker.login(config.broker_name, driver, u, p), user);
                                writeToLog("Logged in at broker.");
                            }
                            catch (e) {
                                writeToLog("Login at broker failed with user " + user);
                                if (e instanceof FatalError) {
                                    brokerStore.setPassword(user, undefined);
                                }
                                throw e;
                            }

                            let suggestion;
                            try {
                                writeToLog("Getting available funds of user " + user + "...");
                                let availableFunds = await broker.getAvailableFunds(config.broker_name, driver);
                                writeToLog("Available funds: " + availableFunds);

                                writeToLog("Getting portfolio value of user " + user + "...");
                                const portfolioValue = await broker.getPortfolioValue(config.broker_name, driver);
                                writeToLog("Portfolio value: " + portfolioValue);

                                if (config.max_portfolio_value != null && (typeof config.max_portfolio_value) === 'number') {
                                    if (availableFunds > config.max_portfolio_value - portfolioValue) {
                                        availableFunds = config.max_portfolio_value - portfolioValue;
                                        if (availableFunds < 0) {
                                            availableFunds = 0;
                                        }
                                        writeToLog("Limiting available funds due to config: " + availableFunds);
                                    }
                                }

                                writeToLog("Processing " + suggestions.length + " suggestions of user " + user + "...");
                                for (suggestion of suggestions) {
                                    const day = new Date().getDay();
                                    if (day >= config.broker_open_day && day <= config.broker_close_day) {
                                        const hour = new Date().getHours() + (new Date().getMinutes() / 60.0);
                                        if (hour >= config.broker_open_hours && hour < config.broker_close_hours) {
                                            if (exports.cancel) {
                                                writeToLog("Processing was cancelled by the admin.");
                                                break;
                                            }

                                            availableFunds = await processSuggestion(driver, user, suggestion, availableFunds, jwt);

                                            if (!tanStore.isTanListSet(user)) {
                                                writeToLog("TAN list was invalidated");
                                                break;
                                            }

                                            await sleep(10000);
                                        }
                                        else {
                                            writeToLog("Stopping processing because the time is out of range.");
                                            break;
                                        }
                                    }
                                    else {
                                        writeToLog("Stopping processing because the day is out of range.");
                                        break;
                                    }
                                }
                                writeToLog("All suggestions of user " + user + " processed.");
                            }
                            catch (e) {
                                writeToLog("Error while processing suggestion " + suggestion.ID + " for user " + user + ": " + e.message + "\n" + e.stack);
                                throw e;
                            }
                            finally {
                                writeToLog("Logging out at broker...");
                                await broker.logout(config.broker_name, driver);
                                writeToLog("Logged out at broker.");
                            }
                        }
                        finally {
                            try {
                                writeToLog("Closing browser...");
                                await driver.cleanup();
                                writeToLog("Browser closed.");
                            }
                            catch (e) {
                                writeToLog("Error while closing browser: " + e.message);
                            }
                        }
                    }
                    else {
                        writeToLog("No tan list set for user " + user);
                    }
                }
                else {
                    writeToLog("No broker password set for user " + user);
                }
            }
            else {
                writeToLog("No broker user available for user " + user);
            }
        }
    }
}

async function runActually() {
    try {
        exports.cancel = false;
        const users = brokerStore.getUsers();
        for (let userIndex = 0; userIndex < users.length; ++userIndex) {
            const user = users[userIndex];
            try {
                const day = new Date().getDay();
                if (day >= config.broker_open_day && day <= config.broker_close_day) {
                    const hour = new Date().getHours() + (new Date().getMinutes() / 60.0);
                    if (hour >= config.broker_open_hours && hour < config.broker_close_hours) {
                        if (exports.cancel) {
                            writeToLog("Processing was cancelled by the admin.");
                            break;
                        }
                        await processSuggestions(user);
                    }
                    else {
                        writeToLog("Stopping processing because the time is out of range.");
                        break;
                    }
                }
                else {
                    writeToLog("Stopping processing because the day is out of range.");
                    break;
                }
            }
            catch (err) {
                writeToLog("error while processing suggestions for user " + user + ": " + err.message + "\n" + err.stack);
            }
        }
    }
    catch (error) {
        writeToLog("error in main job: " + error.message + "\n" + error.stack);
    }
    exports.lastRun = new Date();
}

let isRunning = false;
async function runWithGuard() {
    if (exports.isSuspended) {
        writeToLog("Job was not started because it is suspended.");
        return;
    }
    if (!isRunning) {
        isRunning = true;
        exports.isRunning = true;
        await runActually();
        isRunning = false;
        exports.isRunning = false;
    }
}

exports.run = async function () {
    await runWithGuard();
    setTimeout(exports.run, config.job_main_interval_seconds * 1000);
};

exports.runManually = async function () {
    if (!isRunning) {
        runWithGuard();
        return true;
    }
    return false;
}

exports.processSuggestions = processSuggestions;
exports.processSuggestion = processSuggestion;