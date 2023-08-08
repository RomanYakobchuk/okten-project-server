import {CustomRequest} from "../interfaces/func";

import {OAuth, User, Manager, Admin} from "../dataBase";

import {CustomError} from '../errors';
import {UserService, PasswordService, TokenService} from '../services';
import {authValidator} from '../validators';
import {tokenTypeEnum} from '../enums';
import {constants} from '../configs';
import {NextFunction, Response} from "express";
import {IManager, IOauth, IUser} from "../interfaces/common";
import {ObjectId} from "mongoose";

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

            const tokenInfo = await OAuth.findOne({access_token}).populate('userId');

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

            const tokenInfo = await OAuth.findOne({refresh_token}).populate("userId");
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
        try {
            const {email} = req.body;
            const user = await this.userService.findOneUser({email});

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
    }

    async isLoginBodyValid(req: CustomRequest, res: Response, next: NextFunction) {
        try {
            const {error, value} = authValidator.login.validate(req.body);
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
        const user = await User.findOne({activationLink})
        if (!user) {
            throw new Error("Uncorrected link")
        }
        user.isActivated = true;

        await this.userService.updateOneUser({_id: user?._id}, user);

        return {user}

    }

    async verifyNumber(id: string, code: number) {

        const user = await User.findOne({_id: id}) as IUser;

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
                    const isManager = await Manager.findOne({user: _id}) as IManager;
                    req.newStatus = isManager.verify?.isVerify ? status : 'user';
                } else if (status === 'admin') {
                    const isAdmin = await Admin.findOne({user: _id});
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
                statusHandler(user.status, user._id);
            } else if (type === 'check') {
                const {userId} = req.user as IOauth;
                const user = userId as IUser;
                statusHandler(user.status, user._id);
            }
        } catch (e) {
            next(e)
        }
    }
}


export default new AuthMiddleware();