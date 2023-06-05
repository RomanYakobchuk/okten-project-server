const jwt = require('jsonwebtoken');

const { configs } = require("../configs");
const { CustomError } = require('../errors');
const { tokenTypeEnum } = require('../enums');

function generateAuthTokens(payload = {}) {
    const access_token = jwt.sign(payload, configs.ACCESS_TOKEN_SECRET, { expiresIn: '3h' });
    const refresh_token = jwt.sign(payload, configs.REFRESH_TOKEN_SECRET, { expiresIn: '30d' });

    return {
        access_token,
        refresh_token
    }
}

function checkToken(token = '', tokenType ) {
    try {
        let secret;

        if(tokenType === tokenTypeEnum.ACCESS) secret = configs.ACCESS_TOKEN_SECRET;
        if(tokenType === tokenTypeEnum.REFRESH) secret = configs.REFRESH_TOKEN_SECRET;
        if(tokenType === tokenTypeEnum.TOKEN_WITH_DATA) secret = configs.TOKEN_WITH_DATA;

        return jwt.verify(token, secret);
    } catch (e) {
        throw new CustomError(`Token not valid`, 401);
    }
}

function tokenWithData(data, live) {
    const token = jwt.sign({...data}, configs.TOKEN_WITH_DATA, {expiresIn: live});

    return {token}
}

module.exports = {
    checkToken,
    generateAuthTokens,
    tokenWithData
}