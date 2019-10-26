const request = require('request');
const dateFormat = require('dateformat');
const config = require('../config/envconfig');

async function get(url, jwt) {
    return new Promise((resolve, reject) => {
        let headers = {}
        if (jwt) {
            headers = { 'Authorization': 'Bearer ' + jwt };
        }
        request({ url: url, json: true, proxy: config.proxy, headers: headers }, (err, response, body) => {
            if (err) {
                reject(err);
            }
            if (!response) {
                reject(new Error("unknown error"));
            }
            if (response.statusCode != 200) {
                reject(new Error("HTTP " + response.statusCode));
            }
            resolve(body);
        });
    });
}

async function post(url, data, jwt) {
    return new Promise((resolve, reject) => {
        let headers = {}
        if (jwt) {
            headers = { 'Authorization': 'Bearer ' + jwt };
        }
        request.post({ url: url, json: true, body: data, proxy: config.proxy, followAllRedirects: true, headers: headers }, (err, response, body) => {
            if (err) {
                reject(err);
            }
            else if (!response) {
                reject(new Error("unknown error"));
            }
            else if (response.statusCode != 200) {
                reject(new Error("HTTP " + response.statusCode));
            }
            else resolve(body);
        });
    });
}

exports.login = async function (userName, password) {
    const response = await post(config.naytrading_url + "/api/login", { email: userName, password: password });
    if (response && response.token && response.token.length) {
        return response.token;
    }
    else {
        throw new Error("Error while signing in: " + response.statusCode);
    }
};

exports.getTrades = async function (time, jwt) {
    return get(config.naytrading_url + "/api/export/user/trades/" + dateFormat(time, 'yyyymmdd'), jwt);
};

exports.setInstrumentWeight = async function (isinOrWkn, type, weight, jwt) {
    console.log("Setting weight " + type + " of instrument " + isinOrWkn + " to " + weight + " at naytrading...");
    try {
        const response = await post(config.naytrading_url + "/api/weight/" + isinOrWkn + "/" + type + "/" + weight, {}, jwt);
        if (response && JSON.stringify(response) == "{}") {
            console.log("Weight is set.");
        }
        else {
            throw new Error(response ? JSON.stringify(response) : "[empty response]");
        }
    }
    catch (error) {
        console.log("Error while setting instrument weight: " + error.message + "\n" + error.stack);
        throw error;
    }
};

exports.getOpenSuggestions = async function (jwt) {
    try {
        const response = await get(config.naytrading_url + "/api/trader/suggestions", jwt);
        if (response && response.length >= 0) {
            return response;
        }
        else {
            throw new Error(response ? JSON.stringify(response) : "[empty response]");
        }
    }
    catch (error) {
        console.log("Error while loading open suggestions: " + error.message + "\n" + error.stack);
        throw error;
    }
};

exports.hasNewerSuggestion = async function (suggestionId, jwt) {
    try {
        const response = await get(config.naytrading_url + "/api/trader/suggestion/" + suggestionId + "/newer", jwt);
        if (response && typeof (response.hasNewerSuggestion) !== 'undefined') {
            return response.hasNewerSuggestion;
        }
        else {
            throw new Error(response ? JSON.stringify(response) : "[empty response]");
        }
    }
    catch (error) {
        console.log("Error while checking for newer suggestion: " + error.message + "\n" + error.stack);
        throw error;
    }
};

exports.saveTradeLog = async function (log, jwt) {
    try {
        const response = await post(config.naytrading_url + "/api/trader/log", log, jwt);
        if (response && response.ID >= 0) {
            return response.ID;
        }
        else {
            throw new Error(response ? JSON.stringify(response) : "[empty response]");
        }
    }
    catch (error) {
        console.log("Error while saving log for suggestion: " + error.message + "\n" + error.stack);
        throw error;
    }
}