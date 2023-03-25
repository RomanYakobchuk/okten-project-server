const {userService, s3Service, institutionService} = require('../services');
const {userPresenter} = require('../presenters/user.presenter');
const {getWithPagination} = require("../services/institution.service");
const {User} = require("../dataBase");
const {CustomError} = require("../errors");
const {tokenWithData} = require("../services/token.service");
const {startSession} = require("mongoose");
// const Ably = require("ably");

// const ably = new Ably.Realtime(`${process.env.ABLY_API_KEY}`);
// const channel = ably.channels.get('my-channel');


module.exports = {
    findUsers: async (req, res, next) => {
        try {
            const {_end, _start, _sort, title_like = "", type = "", _order} = req.query;
            const {items, count} = await getWithPagination(User, _end, _order, _start, _sort, title_like, type);

            res.header('x-total-count', count);
            res.header('Access-Control-Expose-Headers', 'x-total-count');

            res.status(200).json(items);
        } catch (e) {
            next(e);
        }
    },

    getUserById: async (req, res, next) => {
        try {
            const {id} = req.params;

            const user = await userService.findOneUser({_id: id}).populate("allInstitutions").populate("favoritePlaces").populate("myRatings").populate('myReviews');

            if (!user) {
                return next(new CustomError('User not found'));
            }

            const userForResponse = userPresenter(user);

            res.status(200).json(userForResponse);
        } catch (e) {
            next(e);
        }
    },

    getUserInfo: async (req, res, next) => {
        try {
            const {id} = req.params;

            const user = await userService.findOneUser({_id: id});

            if (!user) {
                return next(new CustomError('User not found'));
            }

            const userForResponse = userPresenter(user);

            res.status(200).json(userForResponse);
        } catch (e) {
            next(e);
        }
    },

    updateUserById: async (req, res, next) => {
        try {
            const {id} = req.params;

            const {userId} = req.user;

            const {avatar, phone, name, dOB, currentId} = req.body;

            if (!userId?.isAdmin && id !== currentId) {
                return res.status(403).json({message: 'Access Denied'})
            }

            const updatedUser = await userService.updateOneUser({_id: id}, {name, avatar, phone, dOB});

            const userForResponse = userPresenter(updatedUser);

            const {token} = tokenWithData(userForResponse, "12h");

            res.status(201).json({user: token});
        } catch (e) {
            next(e);
        }
    },

    deleteUserById: async (req, res, next) => {
        try {
            const {_id} = req.user;

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
            // channel.publish('favorite', id)

            const {userId: user} = req.user;
            const institution = req.institution;

            const session = await startSession();
            session.startTransaction();

            if (!institution) {
                return next(new CustomError('Institution not found'));
            }

            const isInclude = user?.favoritePlaces?.includes(institution._id)

            if (isInclude) {
                // channel.publish('favorite', {institutionId: id})
                await user?.favoritePlaces?.pull(institution._id)
                await user.save({session})
                await session.commitTransaction();
                const userForResponse = userPresenter(user);

                const {token} = tokenWithData(userForResponse, "12h");

                return res.status(201).json({user: token});
            } else if (!isInclude) {
                // channel.publish('favorite', {institutionId: id})
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
        try {
            const {userId: user} = req.user;
            const {search_like} = req.query;

            if (!user?.isAdmin) {
                return next(new CustomError("Forbidden", 403))
            }

            const query = {};
            const {count, items} = await userService.getUsersByQuery(User, query, search_like)

            res.header('x-total-count', count);
            res.header('Access-Control-Expose-Headers', 'x-total-count');

            res.status(200).json(items)
        } catch (e) {
            next(e)
        }
    }
};