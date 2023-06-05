const moment = require("moment");

const {reviewService} = require("../services");
const {CustomError} = require("../errors");
const {Review} = require("../dataBase");

async function calculateAverageRating(institution) {
    try {
        const pipeline = [
            {
                $match: {institutionId: institution?._id}
            },
            {
                $group: {
                    _id: null,
                    averageRating: {$avg: '$grade'}
                }
            }
        ];

        const result = await Review.aggregate(pipeline);

        if (result?.length > 0) {
            institution.rating = result[0].averageRating;
            await institution.save();
        }
    } catch (e) {
        console.log(e)
    }
}

module.exports = {
    allReviews: async (req, res, next) => {
        try {

        } catch (e) {
            next(e)
        }
    },
    allReviewByInstitutionId: async (req, res, next) => {
        const institution = req.data_info;

        const {_order, _sort, _end, _start} = req.query;

        try {

            const {
                items,
                count
            } = await reviewService.getAllByPlaceWithPagination(institution?._id, _end, _start, _sort, _order, "institutionId", 'createdBy', '_id avatar name');

            res.header('x-total-count', count);
            res.header('Access-Control-Expose-Headers', 'x-total-count');

            res.status(200).json(items);
        } catch (e) {
            next(e)
        }
    },
    latestUserReview: (type) => async (req, res, next) => {
        const institution = req.data_info;
        const {userId: user} = req.user;
        try {
            const userLatestReview = await reviewService
                .getOneByParams({institutionId: institution?._id, createdBy: user?._id})
                .sort({createdAt: -1});

            let isAllowedNewReview;
            if (userLatestReview) {
                if (type === 'check') {
                    const oneWeekAgo = moment().subtract(1, 'week');
                    isAllowedNewReview = moment(userLatestReview.createdAt).isBefore(oneWeekAgo);
                    req.isAllowedNewReview = isAllowedNewReview;
                    return next();
                } else if (type === 'info') {
                    const oneWeekAgo = moment().subtract(1, 'week');
                    isAllowedNewReview = moment(userLatestReview.createdAt).isBefore(oneWeekAgo);
                    res.status(200).json({
                        isAllowedNewReview: isAllowedNewReview
                    })
                }
            } else {
                if (type === 'check') {
                    req.isAllowedNewReview = true;
                    return next();
                } else if (type === 'info') {
                    res.status(200).json({isAllowedNewReview: true})
                }
            }
        } catch (e) {
            next(e)
        }
    },

    allReviewByUserId: async (req, res, next) => {
        const {_order, _sort, _end, _start} = req.query;
        const {userId: user} = req.user;
        const userExist = req.userExist;

        try {

            if (userExist?._id?.toString() !== user?._id?.toString() && user?.status !== 'admin') {
                return next(new CustomError("Access denied", 403))
            }

            const {
                items,
                count
            } = await reviewService.getAllByPlaceWithPagination(userExist?._id, _end, _start, _sort, _order, "createdBy", "institutionId", 'title mainPhoto type _id');

            res.header('x-total-count', count);
            res.header('Access-Control-Expose-Headers', 'x-total-count');

            res.status(200).json(items);
        } catch (e) {
            next(e)
        }
    },
    createReview: async (req, res, next) => {
        const {grade, text} = req.body;
        const {userId: user} = req.user;
        const institution = req.data_info;
        const isAllowedNewReview = req.isAllowedNewReview;
        try {

            if (!isAllowedNewReview) {
                return next(new CustomError("Allowed block", 403))
            }

            if (institution.createdBy?.toString() === user?._id?.toString()) {
                return next(new CustomError("You cannot evaluate your own institution", 403))
            }

            await reviewService.createReview({
                text: text,
                grade,
                createdBy: user?._id,
                institutionId: institution?._id
            })

            await calculateAverageRating(institution);

            res.status(200).json({message: 'Review added successfully'})
        } catch (e) {
            next(e)
        }
    }
}
