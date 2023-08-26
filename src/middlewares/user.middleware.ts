import {NextFunction, Response} from "express";

import {CustomError} from '../errors';
import {UserService} from '../services';
import {CustomRequest} from "../interfaces/func";
import {IUser} from "../interfaces/common";
import {commonMiddleware} from "./index";
import {authValidator, userValidator} from "../validators";
import {getFacebookUserInfo, getGoogleUserInfo} from "../clients";

class UserMiddleware {

    private userService: UserService;

    constructor() {
        this.userService = new UserService();

        this.isUserPresent = this.isUserPresent.bind(this);
        this.isUserUniqByEmail = this.isUserUniqByEmail.bind(this);
        this.isUserUniqByGoogle = this.isUserUniqByGoogle.bind(this);
        this.isUserUniqByFacebook = this.isUserUniqByFacebook.bind(this);
    }

    async isUserPresent(req: CustomRequest, res: Response, next: NextFunction) {
        try {
            const {id} = req.params;
            const {userId} = req.body;

            let currentId;

            if (id) {
                currentId = id
            } else if (!id && userId) {
                currentId = userId
            }
            const user = await this.userService.findOneUser({_id: currentId});
            if (!user) {
                return next(new CustomError('User not found'));
            }

            req.userExist = user;
            next();
        } catch (e) {
            console.log(`isUserPresent user.middleware`)
            next(e);
        }
    }

    async isUserUniqByEmail(req: CustomRequest, res: Response, next: NextFunction) {
        const {email, registerBy} = req.body;
        try {
            if (registerBy === 'Email') {

                commonMiddleware.isDateValid(userValidator.newUserValidator);

                const user = await this.userService.findOneUser({email, registerBy}) as IUser;
                if (user) {
                    return next(new CustomError(`User with email [ ${email} ] is exist`, 409));
                }
                req.user = user;
            }
            next();
        } catch (e) {
            next(e);
        }
    }

    async isUserUniqByGoogle(req: CustomRequest, res: Response, next: NextFunction) {
        const {access_token, registerBy} = req.body;
        try {
            if (registerBy === 'Google' && access_token) {
                const ticket = await getGoogleUserInfo(access_token);

                req.body.userData = ticket;
                commonMiddleware.isDateValid(authValidator.googleLogin);

                const user = await this.userService.findOneUser({email: ticket?.email, registerBy}) as IUser;
                if (user) {
                    return next(new CustomError(`User with email [ ${ticket?.email} ] is exist`, 409));
                }
                req.user = user;
            }
            next();
        } catch (e) {
            next(e);
        }
    }

    async isUserUniqByFacebook(req: CustomRequest, res: Response, next: NextFunction) {
        const {access_token, userId, registerBy} = req.body;
        try {
            if (registerBy === 'Facebook') {
                commonMiddleware.isDateValid(authValidator.facebookLogin);

                const userData = await getFacebookUserInfo(userId, access_token);

                const user = await this.userService.findOneUser({email: userData.email, registerBy}) as IUser;
                if (user) {
                    return next(new CustomError(`User with email [ ${userData.email} ] is exist`, 409));
                }
                req.body.userData = {
                    email: userData?.email,
                    name: userData?.name,
                    picture: userData?.picture?.data?.url,
                    email_verified: true
                }
            }
            next();
        } catch (e) {
            next(e);
        }
    }
}

export default new UserMiddleware();