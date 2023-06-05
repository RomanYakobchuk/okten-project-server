const {startSession} = require("mongoose");

const {userService, s3Service, institutionService, reviewService} = require('../services');
const {userPresenter} = require('../presenters/user.presenter');
const {User} = require("../dataBase");
const {CustomError} = require("../errors");
const {tokenWithData} = require("../services/token.service");

module.exports = {
    findUsers: async (req, res, next) => {
        try {
            res.status(200).json('users')
        } catch (e) {
            next(e);
        }
    },

    getUserInfo: async (req, res, next) => {
        try {
            const {id} = req.params;
            const userStatus = req.newStatus;
            const {userId: currentUser} = req.user;

            const user = await userService
                .findOneUser({_id: id})
                .populate("favoritePlaces");

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
    },

    updateUserById: async (req, res, next) => {
        try {
            const {id} = req.params;

            const {userId} = req.user;

            const {avatar, phone, name, dOB, currentId} = req.body;

            if (userId?.status !== 'admin' && id !== currentId) {
                return res.status(403).json({message: 'Access Denied'})
            }

            const updatedUser = await userService.updateOneUser({_id: id}, {name, avatar, phone, dOB});

            const userForResponse = userPresenter(updatedUser);

            const {token} = tokenWithData(userForResponse, "12h");

            res.status(201).json({user: token, message: 'User data updated successfully'});
        } catch (e) {
            next(e);
        }
    },

    deleteUserById: async (req, res, next) => {
        try {
            const {_id} = req.userExist;
            const {userId: user} = req.user;

            if (user?.status !== "admin") {
                return next(new CustomError("Access denied", 403))
            }

            if (req.user.avatar) {
                await s3Service.deleteFile(req.user.avatar);
            }

            await userService.deleteOneUser({_id: _id});

            res.sendStatus(204);
        } catch (e) {
            next(e);
        }
    },

    addDeleteFavoritePlace: async (req, res, next) => {
        try {
            const {userId: user} = req.user;
            const {id} = req.body;

            const institution = await institutionService.getOneInstitution({_id: id})

            const session = await startSession();
            session.startTransaction();

            if (!institution) {
                return next(new CustomError('Institution not found'));
            }

            const isInclude = user?.favoritePlaces?.includes(institution._id)

            if (isInclude) {
                await user?.favoritePlaces?.pull(institution._id)
                await user.save({session})
                await session.commitTransaction();
                const userForResponse = userPresenter(user);

                const {token} = tokenWithData(userForResponse, "12h");

                return res.status(201).json({user: token});
            } else if (!isInclude) {
                await user?.favoritePlaces?.push(institution._id);
                await user.save({session})
                await session.commitTransaction();
                const userForResponse = userPresenter(user);

                const {token} = tokenWithData(userForResponse, "12h");

                return res.status(201).json({user: token, institution: institution});
            } else {
                return next(new CustomError("Some wrong"))
            }
        } catch (e) {
            next(e)
        }
    },

    findUserByQuery: async (req, res, next) => {
        const {_end, _start, _sort, title_like = "", _order, status, isActivated, phoneVerify, isBlocked} = req.query;
        const userStatus = req.newStatus;
        if (userStatus !== 'admin') {
            return next(new CustomError("Access denied", 403));
        }

        const query = {};
        if (title_like) query.title_like = title_like;
        if (status) query.status = status;
        if (isActivated === true || isActivated === false) query.isActivated = isActivated;
        if (phoneVerify === true || phoneVerify === false) query.phoneVerify = phoneVerify;
        if (isBlocked === true || isBlocked === false) query.blocked = {isBlocked};
        try {
            const {items, count} = await userService.getUsersByQuery(_end, _order, _start, _sort, title_like, status, isActivated, phoneVerify, isBlocked);

            res.header('x-total-count', count);
            res.header('Access-Control-Expose-Headers', 'x-total-count');

            res.status(200).json(items);
        } catch (e) {
            next(e)
        }
    },

    updateUserByAdmin: async (req, res, next) => {
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
};