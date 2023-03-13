const {userService, passwordService, emailService, smsService, s3Service, institutionService} = require('../services');
const {userPresenter} = require('../presenters/user.presenter');
const {getWithPagination} = require("../services/institution.service");
const {User} = require("../dataBase");
const {CustomError} = require("../errors");
const {tokenWithData} = require("../services/token.service");
const {startSession} = require("mongoose");


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

            const user = await userService.findOneUser({_id: id}).populate("allInstitutions").populate("favoritePlaces").populate("myReviews");

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

            const {institutionId} = req.body;

            const {userId: user} = req.user;

            const session = await startSession();
            session.startTransaction();

            const institution = await institutionService.getOneInstitution({_id: institutionId}).session(session);

            if (!institution) {
                return next(new CustomError('Institution not found'));
            }

            const isInclude = user?.favoritePlaces?.includes(institution._id)

            if (isInclude) {
                // const item = user?.favoritePlaces.indexOf(institution._id);
                // if (item !== -1) {
                //     await user?.favoritePlaces.splice(item, 1)
                // }
                await user?.favoritePlaces?.pull(institution._id)
                await user.save({session})
                await session.commitTransaction();
                return  res.status(200).json({message: "Institution has been removed from the favorites successfully "})
            } else if (!isInclude) {
                await user?.favoritePlaces?.push(institution._id);
                await user.save({session})
                await session.commitTransaction();
                return  res.status(200).json({message: "Institution has been added to the favorites successfully "})
            } else {
                return next(new CustomError("Some wrong"))
            }


        } catch (e) {
            next(e)
        }
    }
};