import {NextFunction, Response} from "express";

import {SubscribeNotificationService} from "../services";
import {CustomRequest} from "../interfaces/func";
import {ISubscribe,} from "../interfaces/common";

class SubscribeNotificationController {
    private subscribeNotificationService: SubscribeNotificationService;

    constructor() {
        this.subscribeNotificationService = new SubscribeNotificationService();

        this.updateSubscribe = this.updateSubscribe.bind(this);
        this.getOneSubscribe = this.getOneSubscribe.bind(this);
        this.getAllSubscribes = this.getAllSubscribes.bind(this);
    }

    async updateSubscribe(req: CustomRequest, res: Response, next: NextFunction) {
        const subscribe = req.subscribe as ISubscribe;
        const {institutionId, subscriberId} = req.body;

        try {
            let isSubscribe: boolean;
            if (subscribe?._id) {
                await this.subscribeNotificationService.deleteSubscribe(institutionId, subscriberId);
                isSubscribe = false;
            } else {
                await this.subscribeNotificationService.createSubscribe(institutionId, subscriberId);
                isSubscribe = true;
            }
            res.status(200).json({message: `${!isSubscribe ? 'Unfollowed' : 'Followed'}`, isSubscribe})

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

    getAllSubscribes = async (req: CustomRequest, res: Response, next: NextFunction) => {
        const {items, count} = req.subscribes as {count: number, items: ISubscribe[]};
        try {

            res.header('x-total-count', `${count}`);
            res.header('Access-Control-Expose-Headers', 'x-total-count');

            res.status(200).json(items)
        } catch (e) {
            next(e)
        }
    }
}

export default new SubscribeNotificationController();