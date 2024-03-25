import {NextFunction, Response} from "express";

import {CustomError} from '../errors';
import {ManagerService, UserService} from '../services';
import {CustomRequest} from "../interfaces/func";
import {IOauth, IUser} from "../interfaces/common";
import {commonMiddleware} from "./index";
import {authValidator, userValidator} from "../validators";
import {getFacebookUserInfo, getGoogleUserInfo} from "../clients";

class UserMiddleware {

    private userService: UserService;
    private managerService: ManagerService;

    constructor() {
        this.userService = new UserService();
        this.managerService = new ManagerService();

        this.isUserPresent = this.isUserPresent.bind(this);
        this.isUserUniqByEmail = this.isUserUniqByEmail.bind(this);
        this.isUserUniqByGoogle = this.isUserUniqByGoogle.bind(this);
        this.isUserUniqByFacebook = this.isUserUniqByFacebook.bind(this);
        this.checkUniqueIndicator = this.checkUniqueIndicator.bind(this);
    }

    isUserPresent = (bodyData: string = 'userId') => async (req: CustomRequest, _: Response, next: NextFunction) => {
        const {id} = req.params;
        if (!bodyData) {
            bodyData = 'userId'
        }
        const userId = req.body[bodyData];
        const {userId: currentUserId} = req.user as IOauth;
        const currentUser = currentUserId as IUser;
        const status = req.newStatus;
        try {
            if (status === 'admin') {

                let currentId = id || userId;

                const user = await this.userService.findOneUser({_id: currentId});
                if (!user) {
                    return next(new CustomError('User not found', 403));
                }
                if (bodyData === 'managerId') {
                    const manager = await this.managerService.findOneManager({_id: userId})?.populate('user');
                    if (!manager) {
                        return next(new CustomError('Manager not found', 403));
                    }
                    next();
                }
                req.userExist = user;
            } else {
                req.userExist = currentUser;
            }
            next();
        } catch (e) {
            next(e);
        }
    }

    async isUserUniqByEmail(req: CustomRequest, res: Response, next: NextFunction) {
        const {email, registerBy} = req.body;
        try {
            if (registerBy === 'Email') {

                commonMiddleware.isDateValid(userValidator.newUserValidator);

                const user = await this.userService.findOneUser({email}) as IUser;
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

                const user = await this.userService.findOneUser({email: ticket?.email}) as IUser;
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

                const user = await this.userService.findOneUser({email: userData.email}) as IUser;
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

    checkUniqueIndicator = ({type}: {
        type: "find" | "create"
    }) => async (req: CustomRequest, _: Response, next: NextFunction) => {
        const {indicator: indicatorBody} = req.body;
        const {indicator: indicatorParams} = req.params;
        const user = req.userExist as IUser;
        const status = req.newStatus;
        try {
            const indicator = indicatorBody || indicatorParams;
            const filter: Array<any> = [
                {'uniqueIndicator.value': indicator},
                {_id: {$ne: user?._id}}
            ];
            if (status !== 'admin') {
                filter.push(
                    {"uniqueIndicator.type": "public"},
                )
            }
            const userExist = await this.userService.findOneUser({
                $and: [
                    ...filter
                ]
            });
            if (type === 'create' && userExist) {
                if (user?._id?.toString() !== userExist?._id?.toString()) {
                    return next(new CustomError('Indicator is exist, change another', 409));
                }
            }
            if (type === 'find') {
                if (!userExist) {
                    return next(new CustomError('User not found', 404));
                } else {
                    req.userExist = userExist;
                }
            }

            next();
        } catch (e) {
            next(e);
        }
    }
}

export default new UserMiddleware();