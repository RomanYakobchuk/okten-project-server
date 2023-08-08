import {NextFunction, Response} from "express";

import { CustomError } from '../errors';
import { UserService } from '../services';
import {CustomRequest} from "../interfaces/func";
import {IUser} from "../interfaces/common";

class UserMiddleware {

    private userService: UserService;

    constructor() {
        this.userService = new UserService();

        this.isUserPresent = this.isUserPresent.bind(this);
        this.isUserUniq = this.isUserUniq.bind(this);
    }

    async isUserPresent(req: CustomRequest, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const { userId } = req.body;

            let currentId;

            if (id) {
                currentId = id
            } else if (!id && userId) {
                currentId = userId
            }
            const user = await this.userService.findOneUser({ _id: currentId });
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

    async isUserUniq(req: CustomRequest, res: Response, next: NextFunction) {
        try {
            const { email } = req.body;

            const user = await this.userService.findOneUser({ email }) as IUser;
            if (user) {
                return next(new CustomError(`User with email [ ${email} ] is exist`, 409));
            }
            req.user = user;
            next();
        } catch (e) {
            next(e);
        }
    }
}

export default new UserMiddleware();