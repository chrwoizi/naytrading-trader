const config = require('../config/envconfig');
const browser = require(config.naytrading_trader + "/app/clients/browser");
const errors = require(config.naytrading_trader + "/app/clients/errors");
const FatalError = errors.FatalError;
const CancelOrderFatalError = errors.CancelOrderFatalError;
const CancelOrderTemporaryError = errors.CancelOrderTemporaryError;

exports.action_buy = "buy";
exports.action_sell = "sell";

exports.login = async function (driver, user, password) {
    // throw new FatalError("login failed. stop processing.");
};

exports.getAvailableFunds = async function (driver) {
    return 100.50;
};

exports.getOwnedQuantity = async function (driver, isin, wkn) {
    return 5;
}

exports.getPrice = async function (driver, isinOrWkn, action) {
    return 12.99;
};

exports.getTanChallenge = async function (driver, quantity, action) {
    const result = {};
    result.CustomProperty1 = 1;
    result.CustomProperty2 = 7;
    result.CustomProperty3 = 4;
    return result;
};

exports.getQuote = async function (driver, tan) {
    // throw new CancelOrderTemporaryError("trading was suspended for this stock. retry later.");
    return 12.99;
};

exports.placeOrder = async function (driver) {
    // throw new CancelOrderFatalError("order failed. status unknown. do not retry.");
};

exports.logout = async function (driver) {

};

exports.getTan = async function (tans, challenge) {
    return tans.split(',')[challenge.CustomProperty1] + tans.split(',')[challenge.CustomProperty2] + tans.split(',')[challenge.CustomProperty3];
};

exports.validateTanList = async function (tans) {
    if (tans.split(',').length != 99) {
        throw new Error("tan list is invalid");
    }
};