import {Schema, startSession} from "mongoose";
import {NextFunction, Response} from "express";

import {CustomRequest} from "../interfaces/func";
import {UserService, InstitutionService, CloudService, TokenService} from '../services';
import {userPresenter} from '../presenters/user.presenter';
import {CustomError} from "../errors";
import managerController from "./manager.controller";
import {IOauth, IUser} from "../interfaces/common";

class UserController {

    private tokenService: TokenService;
    private userService: UserService;
    private institutionService: InstitutionService;
    private cloudService: CloudService;

    constructor() {
        this.userService = new UserService();
        this.cloudService = new CloudService();
        this.institutionService = new InstitutionService();
        this.tokenService = new TokenService();

        this.findUsers = this.findUsers.bind(this);
        this.getUserInfo = this.getUserInfo.bind(this);
        this.updateUserById = this.updateUserById.bind(this);
        this.deleteUserById = this.deleteUserById.bind(this);
        this.addDeleteFavoritePlace = this.addDeleteFavoritePlace.bind(this);
        this.findUserByQuery = this.findUserByQuery.bind(this);
        this.updateUserByAdmin = this.updateUserByAdmin.bind(this);
    }

    async findUsers(req: CustomRequest, res: Response, next: NextFunction) {
        try {
            res.status(200).json('users')
        } catch (e) {
            next(e);
        }
    }
    async getUserInfo(req: CustomRequest, res: Response, next: NextFunction) {
        try {
            const {id} = req.params;
            const userStatus = req.newStatus;
            const {userId} = req.user as IOauth;
            const currentUser = userId as IUser;

            const user = await this.userService
                .findOneUser({_id: id})
                .populate("favoritePlaces") as IUser;

            if (!user) {
                return next(new CustomError('User not found', 404));
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

            await managerController.updateManagersFromUserChanges(updatedUser._id, updatedUser);

            const userForResponse = userPresenter(updatedUser);

            const {token} = await this.tokenService.tokenWithData(userForResponse, "12h");

            res.status(201).json({user: token, message: 'User data updated successfully'});
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
    async addDeleteFavoritePlace(req: CustomRequest, res: Response, next: NextFunction) {
        try {
            const {userId} = req.user as IOauth;
            const user = userId as IUser;
            const {id} = req.body;

            const institution = await this.institutionService.getOneInstitution({_id: id})

            const session = await startSession();
            session.startTransaction();

            if (!institution) {
                return next(new CustomError('Institution not found'));
            }

            const isInclude = user?.favoritePlaces?.includes(institution._id as Schema.Types.ObjectId)

            if (isInclude) {
                user?.favoritePlaces?.pull(institution._id as Schema.Types.ObjectId)
                await user.save({session})
                await session.commitTransaction();
                const userForResponse = userPresenter(user);

                const {token} = await this.tokenService.tokenWithData(userForResponse, "12h");

                return res.status(201).json({user: token});
            } else if (!isInclude) {
                user?.favoritePlaces?.push(institution._id as Schema.Types.ObjectId);
                await user.save({session})
                await session.commitTransaction();
                const userForResponse = userPresenter(user);

                const {token} = await this.tokenService.tokenWithData(userForResponse, "12h");

                return res.status(201).json({user: token, institution: institution});
            } else {
                return next(new CustomError("Some wrong"))
            }
        } catch (e) {
            next(e)
        }
    }
    async findUserByQuery(req: CustomRequest, res: Response, next: NextFunction) {
        const {_end, _start, _sort, title_like = "", _order, status, isActivated, phoneVerify, isBlocked} = req.query;
        const userStatus = req.newStatus;
        if (userStatus !== 'admin') {
            return next(new CustomError("Access denied", 403));
        }

        const query: any = {};
        if (title_like) query.title_like = title_like;
        if (status) query.status = status;
        if (Boolean(isActivated) || !Boolean(isActivated)) query.isActivated = isActivated;
        if (Boolean(phoneVerify) || !Boolean(phoneVerify)) query.phoneVerify = phoneVerify;
        if (Boolean(isBlocked) || !Boolean(isBlocked)) query.blocked = {isBlocked};
        try {
            const {
                items,
                count
            } = await this.userService.getUsersByQuery(Number(_end), _order, Number(_start), _sort, title_like as string, status as string, Boolean(isActivated), Boolean(phoneVerify), Boolean(isBlocked));

            res.header('x-total-count', `${count}`);
            res.header('Access-Control-Expose-Headers', 'x-total-count');

            res.status(200).json(items);
        } catch (e) {
            next(e)
        }
    }
    async updateUserByAdmin(req: CustomRequest, res: Response, next: NextFunction) {
        const userStatus = req.newStatus;
        const userForUpdate = req.userExist;

        if (userStatus !== 'admin') {
            return next(new CustomError('Access denied', 403));
        }
        try {
            // const {name, email, status, phone, dOB, isActivated, phoneVerify, blocked} = req.body;
            const {...dataToUpdate} = req.body;
        } catch (e) {
            next(e)
        }
    }
}

export default new UserController();