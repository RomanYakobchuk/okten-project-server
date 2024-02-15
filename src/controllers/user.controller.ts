import {NextFunction, Response} from "express";

import {CustomRequest} from "../interfaces/func";
import {UserService, CloudService, TokenService} from '../services';
import {userPresenter} from '../presenters/user.presenter';
import {CustomError} from "../errors";
import managerController from "./manager.controller";
import {IOauth, IUser} from "../interfaces/common";

class UserController {

    private tokenService: TokenService;
    private userService: UserService;
    private cloudService: CloudService;

    constructor() {
        this.userService = new UserService();
        this.cloudService = new CloudService();
        this.tokenService = new TokenService();

        this.findUsers = this.findUsers.bind(this);
        this.getUserInfo = this.getUserInfo.bind(this);
        this.updateUserById = this.updateUserById.bind(this);
        this.deleteUserById = this.deleteUserById.bind(this);
        this.findUserByQuery = this.findUserByQuery.bind(this);
        this.updateUserByAdmin = this.updateUserByAdmin.bind(this);
        this.checkUniqueIndicator = this.checkUniqueIndicator.bind(this);
        this.createUniqueIndicator = this.createUniqueIndicator.bind(this);
        this.findUserByIndicator = this.findUserByIndicator.bind(this);
    }

    async findUsers(_: CustomRequest, res: Response, next: NextFunction) {
        try {
            res.status(200).json('users')
        } catch (e) {
            next(e);
        }
    }

    async getUserInfo(req: CustomRequest, res: Response, next: NextFunction) {
            const {id} = req.params;
            const userStatus = req.newStatus;
            const currentUser = req.userExist as IUser;
        try {

            const user = await this.userService
                .findOneUser({_id: id})

            if (!user) {
                return next(new CustomError('UserSchema not found', 404));
            }
            if (currentUser?._id?.toString() !== user?._id.toString() && userStatus !== 'admin') {
                return next(new CustomError("Access denied", 403));
            }

            res.status(200).json(userPresenter(user));
        } catch (e) {
            next(e);
        }
    }

    async updateUserById(req: CustomRequest, res: Response, next: NextFunction) {
        try {
            const {id} = req.params;

            const {userId} = req.user as IOauth;
            const user = userId as IUser;
            const {avatar, phone, name, dOB, currentId} = req.body;

            if (user?.status !== 'admin' && id !== currentId) {
                return res.status(403).json({message: 'Access Denied'})
            }

            const updatedUser = await this.userService.updateOneUser({_id: id}, {name, avatar, phone, dOB}) as IUser;

            await managerController.updateManagersFromUserChanges(updatedUser._id as string, updatedUser);

            const userForResponse = userPresenter(updatedUser);

            const {token} = await this.tokenService.tokenWithData(userForResponse, "12h");

            res.status(201).json({user: token, message: 'UserSchema data updated successfully'});
        } catch (e) {
            next(e);
        }
    }

    async deleteUserById(req: CustomRequest, res: Response, next: NextFunction) {
        try {
            const {_id} = req.userExist as IUser;
            const {userId} = req.user as IOauth;
            const user = userId as IUser;

            if (user?.status !== "admin") {
                return next(new CustomError("Access denied", 403))
            }

            if (user.avatar) {
                await this.cloudService.deleteFile(user?.avatar, `user/${user?._id}`)
                // await s3Service.deleteFile(req.user.avatar);
            }

            await this.userService.deleteOneUser({_id: _id});

            res.sendStatus(204);
        } catch (e) {
            next(e);
        }
    }

    async findUserByQuery(req: CustomRequest, res: Response, next: NextFunction) {
        const {_end, _start, _sort, title_like = "", _order, status, isActivated, phoneVerify, isBlocked} = req.query;
        const userStatus = req.newStatus;
        if (userStatus !== 'admin') {
            return next(new CustomError("Access denied", 403));
        }

        try {
            const {
                items,
                count
            } = await this.userService.getUsersByQuery(Number(_end), _order, Number(_start), _sort, title_like as string, status as string, isActivated, phoneVerify, isBlocked);

            res.header('x-total-count', `${count}`);
            res.header('Access-Control-Expose-Headers', 'x-total-count');

            res.status(200).json(items);
        } catch (e) {
            next(e)
        }
    }

    async updateUserByAdmin(req: CustomRequest, _: Response, next: NextFunction) {
        const userStatus = req.newStatus;
        // const userForUpdate = req.userExist;

        if (userStatus !== 'admin') {
            return next(new CustomError('Access denied', 403));
        }
        try {
            // const {name, email, status, phone, dOB, isActivated, phoneVerify, blocked} = req.body;
            // const {...dataToUpdate} = req.body;
            //     other code...
        } catch (e) {
            next(e)
        }
    }

    async checkUniqueIndicator(_: CustomRequest, res: Response, next: NextFunction) {
        try {
            res.status(200).json({message: 'Unique indicator access'})
        } catch (e) {
            next(e);
        }
    }

    async createUniqueIndicator(req: CustomRequest, res: Response, next: NextFunction) {
        const user = req.userExist as IUser;
        const {type, indicator} = req.body;
        try {
            user.uniqueIndicator = {
                value: indicator,
                type: type
            }
            await user.save();
            const {token} = await this.tokenService.tokenWithData(user, "3h");

            res.status(200).json({
                user: token,
                message: 'Unique indicator created'
            })
        } catch (e) {
            next(e);
        }
    }
    async findUserByIndicator(req: CustomRequest, res: Response, next: NextFunction) {
        const userExist = req.userExist as IUser;
        try {
            res.status(200).json({
                user: {
                    _id: userExist?._id,
                    name: userExist?.name,
                    avatar: userExist?.avatar,
                    uniqueIndicator: userExist?.uniqueIndicator,
                    status: userExist?.status
                },
                message: 'User founded'
            })
        } catch (e) {
            next(e);
        }
    }
}

export default new UserController();