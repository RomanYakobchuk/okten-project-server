import {NextFunction, Response} from "express";

import {SubscribeNotificationService} from "../services";
import {CustomRequest} from "../interfaces/func";
import {ISubscribe} from "../interfaces/common";

class SubscribeNotificationController {
    private subscribeNotificationService: SubscribeNotificationService;

    constructor() {
        this.subscribeNotificationService = new SubscribeNotificationService();

        this.updateSubscribe = this.updateSubscribe.bind(this);
        this.getOneSubscribe = this.getOneSubscribe.bind(this);
    }

    async updateSubscribe(req: CustomRequest, res: Response, next: NextFunction) {
        const subscribe = req.subscribe as ISubscribe;
        const {institutionId, subscriberId} = req.body;

        try {
            let isSubscribe: boolean;
            if (subscribe?._id) {
                await this.subscribeNotificationService.deleteSubscribe(institutionId, subscriberId);
                isSubscribe = true;
            } else {
                await this.subscribeNotificationService.createSubscribe(institutionId, subscriberId);
                isSubscribe = false;
            }
            res.status(200).json({message: `${isSubscribe ? 'Unfollowed' : 'Followed'}`})

        } catch (e) {
            next(e);
        }
    }

    async getOneSubscribe(req: CustomRequest, res: Response, next: NextFunction) {
        const subscribe = req.subscribe;
        try {
            res.status(200).json(subscribe);
        } catch (e) {
            next(e);
        }
    }

}

export default new SubscribeNotificationController();