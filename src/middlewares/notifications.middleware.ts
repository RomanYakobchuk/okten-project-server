import {NextFunction, Response} from "express";

import {CustomRequest} from "../interfaces/func";
import {IOauth, IUser} from "../interfaces/common";
import {CustomError} from "../errors";
import {NotificationService} from "../services";

class NotificationsMiddleware {

    private notificationService: NotificationService;
    constructor() {
        this.notificationService = new NotificationService();

        this.checkByAdmin = this.checkByAdmin.bind(this);
        this.checkOne = this.checkOne.bind(this);
    }

   async checkByAdmin(req: CustomRequest, _: Response, next: NextFunction) {
        const {userId} = req.user as IOauth;
        const user = userId as IUser;
        const {id} = req.params;
        const status = req.newStatus;

        try {
            if (user?._id?.toString() !== id && status !== "admin") {
                return next(new CustomError('Access denied', 403));
            }
            next();
        } catch (e) {
            next(e)
        }
    }
    async checkOne(req: CustomRequest, res: Response, next: NextFunction) {
        const {id} = req.params;
        const status = req.newStatus;
        const user = req.userExist as IUser;
        try {
            const notification = await this.notificationService.getOne({_id: id});
            if (!notification) {
                return res.status(404).json({message: 'Notification not found'});
            }
            if (notification?.forUser?.role !== 'admin' && status !== "admin" && notification?.forUser?.userId?.toString() !== user?._id?.toString()) {
                return next(new CustomError('Access denied', 403))
            }
            req.notification = notification;
            next();
        } catch (e) {
            next(e);
        }
    }
}


export default new NotificationsMiddleware();