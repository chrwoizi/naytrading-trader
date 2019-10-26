const config = require('../config/envconfig');
const broker = require('../clients/broker');
const Cryptr = require('cryptr');
const fs = require('fs');
const crypto = require('crypto');

const tanListsByUser = {};

exports.setTanList = async function (userName, tans) {
    await exports.validateTanList(tans);
    tanListsByUser[userName] = tans;
};

exports.getTan = async function (userName, challenge) {
    const tans = tanListsByUser[userName];
    if (tans) {
        return await broker.getTan(config.broker_name, tans, challenge);
    } else {
        throw new Error("tan list is not unlocked");
    }
};

exports.isTanListSet = function (userName) {
    const tans = tanListsByUser[userName];
    if (tans) {
        return true;
    } else {
        return false;
    }
};

exports.validateTanList = async function (tans) {

    if (!(tans)) {
        throw new Error("tan list is empty");
    }

    await broker.validateTanList(config.broker_name, tans);
};

exports.setPassword = async function (userName, password) {
    const cipher = await exports.getEncryptedTanList(userName);
    if (!cipher) {
        throw new Error("tan list is not set");
    }
    const tan = new Cryptr(password).decrypt(cipher);
    try {
        await exports.validateTanList(tan);
    }
    catch (e) {
        throw new Error("password is invalid");
    }

    await exports.setTanList(userName, tan);
}

exports.getEncryptedTanList = async function (user) {
    const userHash = crypto.createHash('md5').update(user).digest('hex');

    try {
        return fs.readFileSync(__dirname + "/../../tans/" + userHash);
    }
    catch (error) {
        return null;
    }
}

exports.setEncryptedTanList = async function (user, encryptedTanList) {
    const userHash = crypto.createHash('md5').update(user).digest('hex');

    try {
        const dir = __dirname + "/../../tans";
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
        fs.writeFileSync(dir + "/" + userHash, encryptedTanList);
    }
    catch (error) {
        throw new Error("tan list could not be set");
    }
}