import {NextFunction, Response} from "express";

import {newNotificationType, NotificationService, UserService} from "../services";
import {CustomRequest} from "../interfaces/func";
import {INotification, IOauth, IUser} from "../interfaces/common";
import {CustomError} from "../errors";

class NotificationController {

    private notificationService: NotificationService;
    private userService: UserService;

    constructor() {
        this.notificationService = new NotificationService();
        this.userService = new UserService();

        this.getUserCount = this.getUserCount.bind(this);
        this.getUserNotifications = this.getUserNotifications.bind(this);
        this.updateToFromBucket = this.updateToFromBucket.bind(this);
        this.getAllInfo = this.getAllInfo.bind(this);
        this.deleteNotification = this.deleteNotification.bind(this);
    }

    async getUserCount(req: CustomRequest, res: Response, next: NextFunction) {
        const user = req.userExist as IUser;
        const status = req.newStatus;
        try {
            const {countIsNotRead} = await this.notificationService.getUserCount({id: user?._id, status});

            res.status(200).json({
                countIsNotRead
            })
        } catch (e) {
            next(e);
        }
    }

    getUserNotifications = (isDelete: "true" | "false") => async (req: CustomRequest, res: Response, next: NextFunction) => {
        const user = req.userExist as IUser;
        const status = req.newStatus;
        const {_end, _start, _sort, _order, title_like, isReading} = req.query;
        try {
            const {items, count} = await this.notificationService.getAllByUser({
                _end: Number(_end),
                _start: Number(_start),
                _sort: _sort as string,
                _order: _order as string | number,
                title_like: title_like as string,
                userId: user?._id,
                status,
                isReading: isReading as string,
                isDelete: isDelete === 'true'
            });

            res.header('x-total-count', `${count}`);
            res.header('Access-Control-Expose-Headers', 'x-total-count');

            res.status(200).json(items);

        } catch (e) {
            next(e)
        }
    }

    async createOne(req: CustomRequest, res: Response, next: NextFunction) {
        const user = req.userExist as IUser;
        const {forUserId} = req.body;
        try {
            const forUser = await this.userService.findOneUser({
                _id: forUserId
            });
            if (!forUser) {
                return next(new CustomError('User not found', 404));
            }

            const newNotification = await this.notificationService.create({
                isRead: false,
                userId: user?._id,
                forUser: {}
            })
        } catch (e) {
            next(e)
        }
    }

    async getAllInfo(req: CustomRequest, res: Response, next: NextFunction) {
        const notification = req.notification as INotification;

        try {
            notification.isRead = true;
            await notification.save();

            const typeNotification = await newNotificationType.getInfoNotificationType({
                type: notification?.type,
                id: notification?.description as string
            });
            if (!typeNotification) {
                return res.status(404).json({message: 'Information not found'})
            }
            res.status(200).json({
                notification,
                typeNotification
            })
        } catch (e) {
            next(e);
        }
    }

    async updateToFromBucket(req: CustomRequest, res: Response, next: NextFunction) {
        const notification = req.notification as INotification;
        try {

            notification.isDelete = !notification.isDelete;
            await notification.save();
            // const updated = await this.notificationService.updateToFromBucket({
            //     id, isDelete: true
            // })
            res.status(200).json({
                notification,
                message: `Delete ${notification.isDelete ? 'to' : 'from'} bucket success`
            });
        } catch (e) {
            next(e)
        }
    }

    async deleteNotification(req: CustomRequest, res: Response, next: NextFunction) {
        const notification = req.notification as INotification;
        try {
            await this.notificationService.deleteOne(notification?._id);
            res.status(201)
        } catch (e) {
            next(e)
        }
    }
}

export default new NotificationController();