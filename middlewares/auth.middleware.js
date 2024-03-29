const {checkToken} = require("../services/token.service");
const {OAuth, User} = require("../dataBase");
const {CustomError} = require('../errors');
const {userService, passwordService} = require('../services');
const {authValidator} = require('../validators');
const {tokenTypeEnum} = require('../enums');
const {constants} = require('../configs');
const {Error} = require("mongoose");

module.exports = {
    checkAccessToken: async (req, res, next) => {
        try {

            const access_token = req.get(constants.AUTHORIZATION);

            if (!access_token) {
                return next(new CustomError('No token', 401));
            }

            checkToken(access_token, tokenTypeEnum.ACCESS);

            const tokenInfo = await OAuth.findOne({access_token}).populate('userId');

            if (!tokenInfo) {
                return next(new CustomError('Token not valid', 401));
            }

            req.user = tokenInfo;
            next();
        } catch (e) {
            next(e);
        }
    },

    checkRefreshToken: async (req, res, next) => {
        try {
            // const refresh_token = req.get(constants.AUTHORIZATION);
            //
            const {refresh_token} = req.body;

            if (!refresh_token) {
                return next(new CustomError('No token', 401));
            }

            checkToken(refresh_token, tokenTypeEnum.REFRESH);

            const tokenInfo = await OAuth.findOne({refresh_token}).populate("userId");
            if (!tokenInfo) {
                return next(new CustomError('Token not valid', 401));
            }

            req.tokenInfo = tokenInfo;
            next();
        } catch (e) {
            next(e);
        }
    },

    isUserPresentForAuth: async (req, res, next) => {
        try {
            const {email} = req.body;

            const user = await userService.findOneUser({email});

            if (!user) {
                return next(new CustomError('Wrong email or password'));
            } else if (!user?.isActivated) {
                return next(new CustomError("User account blocked", 423))
            }

            req.user = user;
            next();
        } catch (e) {
            next(e);
        }
    },

    isLoginBodyValid: async (req, res, next) => {
        try {
            const {error, value} = await authValidator.login.validate(req.body);

            if (error) {
                return next(new CustomError('Wrong email or password'));
            }

            req.body = value;
            next();
        } catch (e) {
            next(e);
        }
    },

    isEmailValid: async (req, res, next) => {
        try {
            const {error, value} = await authValidator.forgotPassword.validate(req.body);

            if (error) {
                return next(new CustomError('Wrong email'));
            }

            req.body = value;
            next();
        } catch (e) {
            next(e);
        }
    },

    isUserPresentByEmail: async (req, res, next) => {
        try {
            const {email} = req.body;

            const user = await userService.findOneUser({email});

            if (!user) {
                return next(new CustomError('Wrong email or password'));
            }

            req.user = user;
            next();
        } catch (e) {
            next(e);
        }
    },

    activate: async (activationLink) => {
        const user = await User.findOne({activationLink})
        if (!user) {
            throw new Error("Uncorrected link")
        }
        user.isActivated = true;

        await userService.updateOneUser({_id: user?._id}, user);

        return {user}

    },
    verifyNumber: async (id, code) => {

        const user = await User.findOne({_id: id});

        await passwordService.compareVerifyCode(user?.verifyCode, code.toString());

        if (!user) {
            throw new Error("Uncorrected code")
        }

        user.phoneVerify = true;

        await userService.updateOneUser({_id: user?._id}, user);
    }
}