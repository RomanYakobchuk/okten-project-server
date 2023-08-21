import {Response, NextFunction} from "express";
import uuid from "uuid";

import {
    PasswordService,
    emailService,
    UserService,
    SmsService,
    TokenService,
    UserFavoritePlacesService
} from '../services';
import {OAuth, Manager, Admin} from '../dataBase';
import {emailActionTypeEnum, smsActionTypeEnum, tokenTypeEnum} from '../enums';
import {userPresenter} from "../presenters/user.presenter";
import {authMiddleware} from "../middlewares";
import {configs} from "../configs";
import {smsTemplateBuilder} from "../common";
import {CustomError} from "../errors";
import {CustomRequest} from "../interfaces/func";
import {IOauth, IUser, IUserFavoritePlaces} from "../interfaces/common";
import {ObjectId} from "mongoose";

class AuthController {

    private passwordService: PasswordService;
    private userService: UserService;
    private smsService: SmsService;
    private tokenService: TokenService;
    private userFavPlaces: UserFavoritePlacesService;

    constructor() {
        this.smsService = new SmsService();
        this.tokenService = new TokenService();
        this.userService = new UserService();
        this.passwordService = new PasswordService();
        this.userFavPlaces = new UserFavoritePlacesService();

        this.login = this.login.bind(this)
        this.register = this.register.bind(this)
        this.forgotPassword = this.forgotPassword.bind(this)
        this.updatePassword = this.updatePassword.bind(this)
        this.activate = this.activate.bind(this)
        this.checkAuthAdmin = this.checkAuthAdmin.bind(this)
        this.activateAgain = this.activateAgain.bind(this)
        this.logoutAllDevices = this.logoutAllDevices.bind(this)
        this.logout = this.logout.bind(this)
        this.refreshToken = this.refreshToken.bind(this)
        this.sendVerifyCodeAgain = this.sendVerifyCodeAgain.bind(this)
        this.refreshToken = this.refreshToken.bind(this)
        this.verifyNumber = this.verifyNumber.bind(this)
    }

    async login(req: CustomRequest, res: Response, next: NextFunction) {
        const favoritePlaces = req.favPlaces as IUserFavoritePlaces;
        try {
            const {password: hashPassword, _id} = req.user as IUser;
            const newStatus = req.newStatus;
            const {password} = req.body;

            await this.passwordService.comparePassword(hashPassword, password);

            const user = req.user as IUser;

            if (user?.blocked?.isBlocked) {
                return next(new CustomError('Account is blocked', 403));
            }
            const tokens = await this.tokenService.generateAuthTokens();
            await OAuth.create({
                userId: _id,
                ...tokens
            });

            let resultUser = userPresenter(user);

            resultUser.status = newStatus!;

            const {token} = await this.tokenService.tokenWithData(resultUser, "3h");

            res.status(200).json({
                user: token,
                favoritePlaces: favoritePlaces.places,
                ...tokens,
                message: 'Login success'
            });
        } catch (e) {
            next(e);
        }
    }

    async register(req: CustomRequest, res: Response, next: NextFunction) {
        try {
            const {email, password, name, phone, dOB, status} = req.body;
            const hash = await this.passwordService.hashPassword(password);

            const activationLink = uuid.v4();


            const newUser = await this.userService.createUser({
                email,
                name,
                phone,
                dOB,
                status,
                password: hash,
                activationLink,
            });
            const userFavPlaces = await this.userFavPlaces.create({userId: newUser._id});

            if (status === 'manager') {
                await Manager.create({
                    user: newUser?._id,
                    name: name,
                    email: email,
                    phone: phone
                });
            }

            newUser.favoritePlaces = userFavPlaces._id;

            await newUser.save();

            await Promise.allSettled([
                emailService(email, emailActionTypeEnum.WELCOME, {name}, `${configs.API_URL}/api/v1/auth/activate/${activationLink}`)
            ]);

            res.status(201).json({message: 'Welcome, you need to confirm your data'});

        } catch (e) {
            console.log(`Помилка у створенні юзера`)
            next(e);
        }
    }

    async activateAgain(req: CustomRequest, res: Response, next: NextFunction) {
        try {
            const {email} = req.body;
            const user = await this.userService.findOneUser({email: email});
            if (!user) {
                throw new Error("User not found")
            }
            const activationLink = uuid.v4();

            await this.userService.updateOneUser({_id: user?._id}, {activationLink})
            await Promise.allSettled([
                emailService(email, emailActionTypeEnum.WELCOME, {name: user?.name}, `${configs.CLIENT_URL}/api/v1/auth/activate/${activationLink}`)
            ]);

            res.status(200).json({message: "Check your email", id: user?._id})
        } catch (e) {
            console.log(`Помилка у активації юзера`)
            next(e);
        }
    }

    async sendVerifyCodeAgain(req: CustomRequest, res: Response, next: NextFunction) {
        try {
            const {userId} = req.body;

            const currentUser = await this.userService.findOneUser({_id: userId});
            if (!currentUser) {
                throw new Error("User not found")
            }
            let code = Math.floor(Math.random() * 90000) + 10000;

            const verifyCode = await this.passwordService.hashVerifyCode(code.toString());

            await this.userService.updateOneUser({_id: currentUser?._id}, {verifyCode});

            const sms = smsTemplateBuilder.welcome[smsActionTypeEnum.WELCOME](currentUser?.name, code);

            await Promise.allSettled([
                this.smsService.sendSMS(currentUser?.phone, sms),
            ]);

        } catch (e) {
            console.log(`Помилка у надсилання смс`)
            next(e);
        }
    }

    async refreshToken(req: CustomRequest, res: Response, next: NextFunction) {
        try {
            const {userId, refresh_token} = req.tokenInfo as IOauth;

            await OAuth.deleteOne({refresh_token});

            const tokens = await this.tokenService.generateAuthTokens();

            await OAuth.create({userId, ...tokens});

            const {token} = await this.tokenService.tokenWithData({...userId}, "3h");

            res.json({
                user: token,
                ...tokens
            });
        } catch (e) {
            next(e);
        }
    }

    async logout(req: CustomRequest, res: Response, next: NextFunction) {
        try {
            const {access_token, userId} = req.user as IOauth;
            const {email, name} = userId as IUser;


            await OAuth.deleteOne({access_token});
            // await Promise.allSettled([
            //     await emailService(email, emailActionTypeEnum.LOGOUT, {name, count: 1})
            // ])

            res.sendStatus(204);
        } catch (e) {
            next(e);
        }
    }

    async logoutAllDevices(req: CustomRequest, res: Response, next: NextFunction) {
        try {
            const {userId} = req.user as IOauth;

            const {_id, email, name} = userId as IUser;

            const {deletedCount} = await OAuth.deleteMany({userId: _id});
            // await Promise.allSettled([
            //     emailService.sendMail(email, emailActionTypeEnum.LOGOUT, {name, count: deletedCount})
            // ])

            res.sendStatus(204);
        } catch (e) {
            next(e);
        }
    }

    async forgotPassword(req: CustomRequest, res: Response, next: NextFunction) {
        try {
            const {
                _id,
                email,
                name,
                status,
                avatar,
                createdAt,
                dOB,
                phone,
                isActivated,
                phoneVerify,
                updatedAt
            } = userPresenter(req.user as IUser);
            const {token} = await this.tokenService.tokenWithData({
                _id,
                name,
                status,
                avatar,
                createdAt,
                dOB,
                phone,
                isActivated,
                updatedAt,
                phoneVerify
            }, "3m");

            await Promise.allSettled([
                emailService(email, emailActionTypeEnum.FORGOT_PASSWORD, {name}, `${configs.CLIENT_URL}/update-password/${token}`)
            ])


            res.sendStatus(204);
        } catch (e) {
            next(e);
        }
    }

    async updatePassword(req: CustomRequest, res: Response, next: NextFunction) {
        try {
            const {email, password, access_token} = req.body;

            await this.tokenService.checkToken(access_token, tokenTypeEnum.ACCESS);

            const hash = await this.passwordService.hashPassword(password);

            await this.userService.updateOneUser({email: email}, {password: hash});

            res.status(200).json({message: "Password updated successful"})
        } catch (e) {
            next(e);
        }
    }

    async activate(req: CustomRequest, res: Response, next: NextFunction) {
        try {
            const activationLink = req.params.link;

            const {user} = await authMiddleware.activate(activationLink);

            if (user?.phoneVerify) {
                return res.redirect(`${configs.CLIENT_URL}/login}`);
            } else if (!user?.phoneVerify) {
                const {token} = await this.tokenService.tokenWithData({_id: user?._id}, "15m");

                let code = Math.floor(Math.random() * 90000) + 10000;

                const verifyCode = await this.passwordService.hashVerifyCode(code.toString());

                await this.userService.updateOneUser({_id: user?._id}, {verifyCode});

                const sms = smsTemplateBuilder.welcome[smsActionTypeEnum.WELCOME](user?.name, code);

                await Promise.allSettled([
                    this.smsService.sendSMS(user?.phone, sms),
                ]);

                return res.redirect(`${configs.CLIENT_URL}/verifyNumber/${token}`);
            }
        } catch (e) {
            next(e)
        }
    }

    async verifyNumber(req: CustomRequest, res: Response, next: NextFunction) {
        try {
            const {userId, verifyCode} = req.body;

            await authMiddleware.verifyNumber(userId, verifyCode);

            return res.redirect(configs.CLIENT_URL!);
        } catch (e) {
            console.log(`Помилка верифікації номера`)
            next(e);
        }
    }

    async checkAuthAdmin(req: CustomRequest, res: Response, next: NextFunction) {

        const {userId} = req.user as IOauth;

        const user = userId as IUser;

        try {
            const admin = await Admin.findOne({user: user?._id});

            if (!admin) {
                return res.status(403).json({message: 'Access denied'})
            }

            res.status(200).json({
                user: admin,
                status: 'auth'
            })
        } catch (e) {
            next(e);
        }
    }
}

export default new AuthController();