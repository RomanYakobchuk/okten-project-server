import {NextFunction, Response} from "express";
import {ObjectId} from "mongoose";
import {CustomRequest} from "../interfaces/func";
import Joi from "joi";
import UAParser from "ua-parser-js";

import {AdminSchema, ManagerSchema, OauthSchema, UserSchema} from "../dataBase";

import {CustomError} from '../errors';
import {PasswordService, TokenService, UserService} from '../services';
import {authValidator} from '../validators';
import {tokenTypeEnum} from '../enums';
import {constants} from '../configs';
import {IManager, IOauth, IUser, IUserAgent} from "../interfaces/common";
import {getFacebookUserInfo, getGitHubUserData, getGoogleUserInfo} from "../clients";


class AuthMiddleware {
    private userService: UserService;
    private passwordService: PasswordService;
    private tokenService: TokenService;

    constructor() {
        this.userService = new UserService();
        this.passwordService = new PasswordService();
        this.tokenService = new TokenService();

        this.checkAccessToken = this.checkAccessToken.bind(this);
        this.checkRefreshToken = this.checkRefreshToken.bind(this);
        this.isUserPresentForAuth = this.isUserPresentForAuth.bind(this);
        this.isLoginBodyValid = this.isLoginBodyValid.bind(this);
        this.isEmailValid = this.isEmailValid.bind(this);
        this.isUserPresentByEmail = this.isUserPresentByEmail.bind(this);
        this.checkStatus = this.checkStatus.bind(this);
        this.checkUserAgent = this.checkUserAgent.bind(this);
        this.checkSpecificSession = this.checkSpecificSession.bind(this);
        this.userSessions = this.userSessions.bind(this);
    }

    async checkAccessToken(req: CustomRequest, _: Response, next: NextFunction) {
        try {

            const access_token = req.get(constants.AUTHORIZATION);

            if (!access_token) {
                return next(new CustomError('No token', 401));
            }

            await this.tokenService.checkToken(access_token, tokenTypeEnum.ACCESS);

            const tokenInfo = await OauthSchema.findOne({access_token}).populate('userId');

            if (!tokenInfo) {
                return next(new CustomError('Token not valid', 401));
            }

            req.user = tokenInfo;
            next();
        } catch (e) {
            next(e);
        }
    }

    async checkSpecificSession(req: CustomRequest, _: Response, next: NextFunction) {
        const {id} = req.params;
        const {userId} = req.user as IOauth;
        const status = req.newStatus;
        try {
            if (!id) {
                return next(new CustomError('Session not found', 404));
            }
            const session = await OauthSchema.findOne({_id: id}).populate('userId');
            if (!session) {
                return next(new CustomError('Session not found', 404));
            }
            const {_id} = userId as IUser;
            const {userId: userSessionData} = session as IOauth;
            const {_id: userSessionId} = userSessionData as IUser;
            if (userSessionId?.toString() !== _id?.toString() && status !== 'admin') {
                return next(new CustomError('Access denied', 403));
            }
            req.tokenInfo = session as IOauth;
            next();

        } catch (e) {
            next(e);
        }
    }
    async userSessions(req: CustomRequest, _: Response, next: NextFunction) {
        const {_id} = req.userExist as IUser;
        try {
            const sessions = await OauthSchema.find({userId: _id}).exec();
            req.sessions = sessions || [];
            next();
        } catch (e) {
            next(e);
        }
    }

    async checkRefreshToken(req: CustomRequest, _: Response, next: NextFunction) {
        try {
            const {refresh_token} = req.body;

            if (!refresh_token) {
                return next(new CustomError('No token', 401));
            }

            await this.tokenService.checkToken(refresh_token, tokenTypeEnum.REFRESH);

            const tokenInfo = await OauthSchema.findOne({refresh_token}).populate("userId");
            if (!tokenInfo) {
                return next(new CustomError('Token not valid', 401));
            }

            req.tokenInfo = tokenInfo;
            next();
        } catch (e) {
            next(e);
        }
    }

    async isUserPresentForAuth(req: CustomRequest, _: Response, next: NextFunction) {
        let {email, registerBy, access_token, userId} = req.body;
        const {code} = req.query;

        try {
            let user: any;
            if (registerBy === 'Email' && email) {
                req.isAuth = false;
            } else if (registerBy === 'Google' && access_token) {
                const ticket = await getGoogleUserInfo(access_token);
                email = ticket.email;
                req.isAuth = true;
            } else if (registerBy === 'Facebook' && access_token && userId) {
                const response = await getFacebookUserInfo(userId, access_token);
                email = response.email
                req.isAuth = true
            } else if (code) {
                const response = await getGitHubUserData(code as string);
                email = response.email;
                req.isAuth = true;
            } else {
                return next(new CustomError('Wrong data', 403))
            }
            user = await this.userService.findOneUser({email, registerBy});

            if (!user) {
                return next(new CustomError('Wrong email or password'));
            }
            if (!user?.isActivated) {
                return next(new CustomError("UserSchema account blocked", 423))
            }

            req.user = user;
            next();
        } catch (e) {
            next(e);
        }
    }

    async checkUserAgent(req: CustomRequest, _: Response, next: NextFunction) {
        const userAgent = req.get(constants.USER_AGENT);
        try {
            if (!userAgent) {
                console.error('Error notification: User agent not found \n Status: 404');
                return next(new CustomError("Something went wrong", 400));
            }
            const parserUA = new UAParser(userAgent);
            const reqUserAgent = parserUA.getResult() as IOauth['userAgent'];
            req.userAgent = {
                browser: {
                    name: reqUserAgent?.browser?.name || "undefined",
                    version: reqUserAgent?.browser?.version || "undefined",
                    major: reqUserAgent?.browser?.major || "undefined",
                },
                device: {
                    type: reqUserAgent?.device?.type || "undefined",
                    model: reqUserAgent?.device?.model || "undefined",
                    vendor: reqUserAgent?.device?.vendor || "undefined"
                },
                engine: {
                    name: reqUserAgent?.engine?.name || "undefined",
                    version: reqUserAgent?.engine?.version || "undefined",
                },
                os: {
                    name: reqUserAgent?.os?.name || "undefined",
                    version: reqUserAgent?.os?.version || "undefined",
                }
            };
            next();
        } catch (e) {
            next(e);
        }
    }

    async isLoginBodyValid(req: CustomRequest, _: Response, next: NextFunction) {
        const {registerBy} = req.body;
        try {
            let validationSchema: Joi.ObjectSchema;

            switch (registerBy) {
                case 'Email':
                    validationSchema = authValidator.login;
                    break;
                case 'Google':
                    validationSchema = authValidator.googleLogin;
                    break;
                case 'Facebook':
                    validationSchema = authValidator.facebookLogin;
                    break;
                default:
                    return next(new CustomError('Invalid registerBy value'));
            }
            const {error, value} = validationSchema.validate(req.body);
            if (error) {
                return next(new CustomError('Wrong email or password'));
            }
            req.body = value;
            next();
        } catch (e) {
            next(e);
        }
    }

    async isEmailValid(req: CustomRequest, _: Response, next: NextFunction) {
        try {
            const {error, value} = authValidator.forgotPassword.validate(req.body);

            if (error) {
                return next(new CustomError('Wrong email'));
            }

            req.body = value;
            next();
        } catch (e) {
            next(e);
        }
    }

    async isUserPresentByEmail(req: CustomRequest, _: Response, next: NextFunction) {
        try {
            const {email} = req.body;

            const user = await this.userService.findOneUser({email});

            if (!user) {
                return next(new CustomError('Wrong email or password'));
            }

            req.user = user;
            next();
        } catch (e) {
            next(e);
        }
    }

    async activate(activationLink: string) {
        const user = await UserSchema.findOne({activationLink})
        if (!user) {
            throw new Error("Uncorrected link")
        }
        user.isActivated = true;

        await this.userService.updateOneUser({_id: user?._id}, user);

        return {user}

    }

    async verifyNumber(id: string, code: number) {

        const user = await UserSchema.findOne({_id: id}) as IUser;

        await this.passwordService.compareVerifyCode(user.verifyCode, code.toString());

        if (!user) {
            throw new Error("Uncorrected code")
        }

        user.phoneVerify = true;

        await this.userService.updateOneUser({_id: user?._id}, user);
    }

    checkStatus = (type: "login" | "check" = "check") => async (req: CustomRequest, _: Response, next: NextFunction) => {
        try {
            if (!type) {
                type = 'check';
            }
            let statusHandler = async (status: IUser['status'], _id: string | string & ObjectId) => {
                if (status === 'manager') {
                    const isManager = await ManagerSchema.findOne({user: _id}) as IManager;
                    req.newStatus = isManager.verify?.isVerify ? status : 'user';
                } else if (status === 'admin') {
                    const isAdmin = await AdminSchema.findOne({user: _id});
                    req.newStatus = isAdmin ? status : 'user';
                } else if (status === 'user') {
                    req.newStatus = status;
                } else {
                    next(new CustomError('Something is wrong', 500))
                    return;
                }
                next();
            }
            if (type === 'login') {
                const user = req.user as IUser;
                await statusHandler(user.status, user._id as string);
            } else if (type === 'check') {
                const {userId} = req.user as IOauth;
                const user = userId as IUser;
                await statusHandler(user.status, user._id as string);
            }
        } catch (e) {
            next(e)
        }
    }
}


export default new AuthMiddleware();