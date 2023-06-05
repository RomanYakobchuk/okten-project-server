const {passwordService, emailService, userService, smsService} = require('../services');
const {generateAuthTokens, checkToken, tokenWithData} = require('../services/token.service');
const {OAuth, Manager} = require('../dataBase');
const {emailActionTypeEnum, smsActionTypeEnum, tokenTypeEnum} = require('../enums');
const {userPresenter} = require("../presenters/user.presenter");
const {authMiddleware} = require("../middlewares");
const {configs} = require("../configs");
const uuid = require("uuid");
const {smsTemplateBuilder} = require("../common");
const {CustomError} = require("../errors");

module.exports = {
    login: async (req, res, next) => {
        try {
            const {password: hashPassword, _id} = req.user;
            const newStatus = req.newStatus;
            const {password} = req.body;

            await passwordService.comparePassword(hashPassword, password);

            const tokens = generateAuthTokens();

            await OAuth.create({
                userId: _id,
                ...tokens
            })
            const user = req.user;

            if (user?.blocked?.isBlocked) {
                return next(new CustomError('Account is blocked', 403));
            }

            let resultUser = userPresenter(user);

            resultUser.status = newStatus;

            const {token} = tokenWithData(resultUser, "3h");

            res.status(200).json({
                user: token,
                ...tokens,
                message: 'Login success'
            });
        } catch (e) {
            next(e);
        }
    },

    register: async (req, res, next) => {
        try {
            const {email, password, name, phone, dOB, status} = req.body;
            const hash = await passwordService.hashPassword(password);

            const activationLink = uuid.v4()

            const newUser = await userService.createUser({
                email,
                name,
                phone,
                dOB,
                status,
                password: hash,
                activationLink
            });

            if (status === 'manager') {
                await Manager.create({
                    user: newUser?._id,
                    name: name,
                    email: email,
                    phone: phone
                });
            }

            await Promise.allSettled([
                emailService.sendMail(email, emailActionTypeEnum.WELCOME, {name}, `${configs.API_URL}/api/v1/auth/activate/${activationLink}`)
            ]);

            res.status(201).json({message: 'Welcome, you need to confirm your data'});

        } catch (e) {
            console.log(`Помилка у створенні юзера`)
            next(e);
        }
    },

    activateAgain: async (req, res, next) => {
        try {
            const {email} = req.body;
            const user = await userService.findOneUser({email: email});
            if (!user) {
                throw new Error("User not found")
            }
            const activationLink = uuid.v4();

            await userService.updateOneUser({_id: user?._id}, {activationLink})
            await Promise.allSettled([
                emailService.sendMail(email, emailActionTypeEnum.WELCOME, {name: user?.name}, `${configs.API_URL}/api/v1/auth/activate/${activationLink}`)
            ]);

            res.status(200).json({message: "Check your email", id: user?._id})
        } catch (e) {
            console.log(`Помилка у активації юзера`)
            next(e);
        }
    },

    sendVerifyCodeAgain: async (req, res, next) => {
        try {
            const {userId} = req.body;

            const currentUser = await userService.findOneUser({_id: userId});
            if (!currentUser) {
                throw new Error("User not found")
            }
            let code = Math.floor(Math.random() * 90000) + 10000;

            const verifyCode = await passwordService.hashVerifyCode(code.toString());

            await userService.updateOneUser({_id: currentUser?._id}, {verifyCode});

            const sms = smsTemplateBuilder[smsActionTypeEnum.WELCOME](currentUser?.name, code);

            await Promise.allSettled([
                smsService.sendSMS(currentUser?.phone, sms),
            ]);

        } catch (e) {
            console.log(`Помилка у надсилання смс`)
            next(e);
        }
    },

    refreshToken: async (req, res, next) => {
        try {
            const {userId, refresh_token} = req.tokenInfo;

            await OAuth.deleteOne({refresh_token});

            const tokens = generateAuthTokens();

            await OAuth.create({userId, ...tokens});

            const {token} = tokenWithData({...userId}, "3h");

            res.json({
                user: token,
                ...tokens
            });
        } catch (e) {
            next(e);
        }
    },

    logout: async (req, res, next) => {
        try {
            const {access_token, userId} = req.user;
            const {email, name} = userId;


            await OAuth.deleteOne({access_token});
            // await Promise.allSettled([
            //     await emailService.sendMail(email, emailActionTypeEnum.LOGOUT, {name, count: 1})
            // ])

            res.sendStatus(204);
        } catch (e) {
            next(e);
        }
    },

    logoutAllDevices: async (req, res, next) => {
        try {
            const {userId: {_id, email, name}} = req.user;

            const {deletedCount} = await OAuth.deleteMany({userId: _id});
            // await Promise.allSettled([
            //     emailService.sendMail(email, emailActionTypeEnum.LOGOUT, {name, count: deletedCount})
            // ])

            res.sendStatus(204);
        } catch (e) {
            next(e);
        }
    },

    forgotPassword: async (req, res, next) => {
        try {
            const {
                _id,
                email,
                name,
                status,
                avatar,
                createdAt,
                dOb,
                phone,
                isActivated,
                phoneVerify,
                updatedAt
            } = userPresenter(req.user);
            const {token} = tokenWithData({
                _id,
                name,
                status,
                avatar,
                createdAt,
                dOb,
                phone,
                isActivated,
                updatedAt,
                phoneVerify
            }, "3m");

            await Promise.allSettled([
                emailService.sendMail(email, emailActionTypeEnum.FORGOT_PASSWORD, {name}, `${configs.CLIENT_URL}/update-password/${token}`)
            ])


            res.sendStatus(204);
        } catch (e) {
            next(e);
        }
    },
    updatePassword: async (req, res, next) => {
        try {
            const {email, password, access_token} = req.body;

            checkToken(access_token, tokenTypeEnum.ACCESS);

            const hash = await passwordService.hashPassword(password);

            await userService.updateOneUser({email: email}, {password: hash});

            res.status(200).json({message: "Password updated successful"})
        } catch (e) {
            next(e);
        }
    },

    activate: async (req, res, next) => {
        try {
            const activationLink = req.params.link;

            const {user} = await authMiddleware.activate(activationLink);

            if (user?.phoneVerify) {
                return res.redirect(`${configs.CLIENT_URL}/login}`);
            } else if (!user?.phoneVerify) {
                const {token} = tokenWithData({_id: user?._id}, "15m");

                let code = Math.floor(Math.random() * 90000) + 10000;

                const verifyCode = await passwordService.hashVerifyCode(code.toString());

                await userService.updateOneUser({_id: user?._id}, {verifyCode});

                const sms = smsTemplateBuilder[smsActionTypeEnum.WELCOME](user?.name, code);

                await Promise.allSettled([
                    smsService.sendSMS(user?.phone, sms),
                ]);

                return res.redirect(`${configs.CLIENT_URL}/verifyNumber/${token}`);
            }
        } catch (e) {
            next(e)
        }
    },

    verifyNumber: async (req, res, next) => {
        try {
            const {userId, verifyCode} = req.body;

            await authMiddleware.verifyNumber(userId, verifyCode);

            return res.redirect(configs.CLIENT_URL);
        } catch (e) {
            console.log(`Помилка верифікації номера`)
            next(e);
        }
    }
};