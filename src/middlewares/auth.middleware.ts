import {NextFunction, Response} from "express";
import {ObjectId} from "mongoose";
import {CustomRequest} from "../interfaces/func";
import Joi from "joi";

import {OauthSchema, UserSchema, ManagerSchema, AdminSchema} from "../dataBase";

import {CustomError} from '../errors';
import {UserService, PasswordService, TokenService} from '../services';
import {authValidator} from '../validators';
import {tokenTypeEnum} from '../enums';
import {configs, constants} from '../configs';
import {IManager, IOauth, IUser} from "../interfaces/common";
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
    }

    async checkAccessToken(req: CustomRequest, res: Response, next: NextFunction) {
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

    async checkRefreshToken(req: CustomRequest, res: Response, next: NextFunction) {
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

    async isUserPresentForAuth(req: CustomRequest, res: Response, next: NextFunction) {
        let {email, registerBy, access_token, userId} = req.body;
        const {code} = req.query;
        const pathUrl = (req.query.state as string) ?? '/';

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
                new CustomError('Wrong email or password');
                return res.redirect(`${configs.CLIENT_URL}/login${pathUrl}`);
            } else if (!user?.isActivated) {
                return next(new CustomError("UserSchema account blocked", 423))
            }

            req.user = user;
            next();
        } catch (e) {
            next(e);
        }
    }

    async isLoginBodyValid(req: CustomRequest, res: Response, next: NextFunction) {
        const {registerBy} = req.body;
        try {
            let validationSchema: Joi.ObjectSchema<any>;

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

    async isEmailValid(req: CustomRequest, res: Response, next: NextFunction) {
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

    async isUserPresentByEmail(req: CustomRequest, res: Response, next: NextFunction) {
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

    checkStatus = (type: string) => async (req: CustomRequest, res: Response, next: NextFunction) => {
        try {
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
                await statusHandler(user.status, user._id);
            } else if (type === 'check') {
                const {userId} = req.user as IOauth;
                const user = userId as IUser;
                await statusHandler(user.status, user._id);
            }
        } catch (e) {
            next(e)
        }
    }
}


export default new AuthMiddleware();