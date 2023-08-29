import {NextFunction, Response} from "express";

import {SubscribeNotificationService} from "../services";
import {CustomRequest} from "../interfaces/func";
import {IInstitution, IOauth, IUser} from "../interfaces/common";

class SubscribeNotificationMiddleware {
    private subscribeNotificationService: SubscribeNotificationService;
    constructor() {
        this.subscribeNotificationService = new SubscribeNotificationService();

        this.checkSubscribe = this.checkSubscribe.bind(this);
    }

    async checkSubscribe(req: CustomRequest, res: Response, next: NextFunction) {
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
}

export default new SubscribeNotificationMiddleware();