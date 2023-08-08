import {NextFunction, Response} from "express";

import {CustomRequest} from "../interfaces/func";
import {CustomError} from "../errors";
import {UserService, ManagerService} from "../services";
import {Manager} from "../dataBase";
import {IManager, IOauth, IUser} from "../interfaces/common";

class ManagerController {

    private userService: UserService;
    private managerService: ManagerService;

    constructor() {
        this.userService = new UserService();
        this.managerService = new ManagerService();

        this.managers = this.managers.bind(this);
        this.oneManager = this.oneManager.bind(this);
        this.updateManagersFromUserChanges = this.updateManagersFromUserChanges.bind(this);
    }

    async managers(req: CustomRequest, res: Response, next: NextFunction) {
        try {
            const {userId} = req.user as IOauth;
            const user = userId as IUser;

            if (user?.status !== 'admin') {
                return next(new CustomError("Access denied", 403))
            }

            const {manager_like = ''} = req.query;

            const searchObject = {};
            if (manager_like !== "") {

                Object.assign(searchObject, {
                    $or: [
                        {name: {$regex: manager_like, $options: 'i'}},
                        {email: {$regex: manager_like, $options: 'i'}},
                        {phone: {$regex: manager_like, $options: 'i'}},
                    ],
                    'verify.isVerify': false
                })
            }
            const managers = await this.managerService
                .findManagers(searchObject)
                .populate('user', 'avatar status dOB _id name email phone')
                .select('_id user')
                .limit(20)
                .sort({['name']: 'asc'})
                .exec();

            res.status(200).json(managers ?? [])
        } catch (e) {
            next(e)
        }
    }
    async oneManager(req: CustomRequest, res: Response, next: NextFunction) {
        try {
            const {id} = req.params;

            const manager = await this.managerService.findOneManager({
                user: id
            }).populate('user');

            if (!manager) {
                return next(new CustomError('User not found', 404))
            }
            res.status(200).json(manager)
        } catch (e) {
            next(e)
        }
    }
    async updateManagersFromUserChanges(userId: string, userData: any) {
        try {
            const manager = await Manager.findOne({user: userId}) as IManager;
            if (userData.name) {
                manager.name = userData.name;
            }
            if (userData.email) {
                manager.email = userData.email;
            }
            if (userData.phone) {
                manager.phone = userData.phone;
            }
            await manager.save();
        } catch (e) {
            return new CustomError('Updated error', 400)
        }
    }
}

export default new ManagerController();