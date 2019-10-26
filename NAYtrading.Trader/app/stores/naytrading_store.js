const naytradingPasswordsByUser = {};

exports.setPassword = function (userName, password) {
    naytradingPasswordsByUser[userName] = password;
};

exports.isPasswordSet = function (userName) {
    const password = naytradingPasswordsByUser[userName];
    if (typeof (password) === 'string' && password.length > 0) {
        return true;
    } else {
        return false;
    }
};

exports.login = async function (callback, userName) {
    const password = naytradingPasswordsByUser[userName];
    if (typeof (password) !== 'string' || password.length == 0) {
        throw new Error("password is not set for user " + userName);
    }

    return await callback(password);
};
