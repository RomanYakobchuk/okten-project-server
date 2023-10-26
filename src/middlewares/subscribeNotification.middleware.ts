import {NextFunction, Response} from "express";

import {SubscribeNotificationService, UserService} from "../services";
import {CustomRequest} from "../interfaces/func";
import {IInstitution, IOauth, IUser} from "../interfaces/common";

class SubscribeNotificationMiddleware {
    private subscribeNotificationService: SubscribeNotificationService;
    private userService: UserService;
    constructor() {
        this.subscribeNotificationService = new SubscribeNotificationService();
        this.userService = new UserService();

        this.checkSubscribe = this.checkSubscribe.bind(this);
        this.checkAllSubscribed = this.checkAllSubscribed.bind(this);
    }

    async checkSubscribe(req: CustomRequest, _: Response, next: NextFunction) {
        const institution = req.data_info as IInstitution;
        const {userId} = req.user as IOauth;
        const user = userId as IUser;
        try {
            req.body = {
                institutionId: institution?._id,
                subscriberId: user?._id
            }
            req.subscribe = await this.subscribeNotificationService.getOneSubscribe(institution?._id, user?._id);
            next();
        } catch (e) {
            next(e)
        }
    }
    checkAllSubscribed = (type: "institutionId" | "subscriberId") => async (req: CustomRequest, _: Response, next: NextFunction) => {
        const {userId} = req.user as IOauth;
        const currentUser = userId as IUser;
        const {id} = req.params;
        const status = req.newStatus;
        const institution = req.data_info as IInstitution;
        try {
            let user = {} as IUser;
            if (status === 'admin') {
                const searchUser = await this.userService.findOneUser({_id: id});
                if (searchUser) {
                    user = searchUser;
                }
            }
            const {items, count} = await this.subscribeNotificationService.getAllSubscribes(type === "subscriberId" ? status === 'admin' ? user?._id : currentUser?._id : institution?._id, type);

            req.subscribes = {items, count};
            next();
        } catch (e) {
            next(e)
        }
    }
}

export default new SubscribeNotificationMiddleware();