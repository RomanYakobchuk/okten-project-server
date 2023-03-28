const {reviewService} = require("../services");
const {CustomError} = require("../errors");
module.exports = {
    allReviews: async (req, res, next) => {
        try {

        } catch (e) {
            next(e)
        }
    },
    allReviewByInstitutionId: async (req, res, next) => {
        try {
            const institution = req.institution;

            const reviews = await reviewService.getAllByParams({institutionId: institution?._id})
                .populate({path: 'createdBy', select: 'name avatar _id'})

            res.status(200).json({
                reviews: reviews ?? []
            })

        } catch (e) {
            next(e)
        }
    },

    allReviewByUserId: async (req, res, next) => {
        try {
            const {userId: user} = req.user;

            const reviews = await reviewService.getAllByParams({createdBy: user?._id})
                .populate({path: 'institutionId', select: 'title mainPhoto type _id'})

            if (!reviews) {
                return next(new CustomError("Reviews not found", 404))
            }

            res.status(200).json({reviews})
        } catch (e) {
            next(e)
        }
    },
    createReview: async (req, res, next) => {
        try {
            const {like, notLike, grade} = req.body;
            const {userId: user} = req.user;
            const institution = req.institution;

            const myInstitution = user.allInstitutions.includes(institution?._id);

            const myUser = institution.createdBy === user?._id && true;

            if (myInstitution || myUser) {
                return next(new CustomError("You cannot rate your own institution", 403))
            }

            const review = await reviewService.createReview({
                text: {
                    like,
                    notLike
                },
                grade,
                createdBy: user?._id,
                institutionId: institution?._id
            })

            user?.myRatings?.push(review?._id);

            institution?.ratings?.push(review?._id);

            if (institution.ratings === 0) {
                institution.rating = institution.rating + grade;
            } else {
                const allPlaceReviews = await reviewService.getAllByParams({institutionId: institution?._id});
                let grades = 0;
                for (const allPlaceReview of allPlaceReviews) {
                    grades += allPlaceReview?.grade
                }
                institution.rating = grades / allPlaceReviews?.length;
            }

            await user.save();
            await institution.save();

            res.status(200).json({
                ...review,
                createdBy: {
                    _id: user?._id,
                    avatar: user?.avatar,
                    name: user?.name
                }
            })
        } catch (e) {
            next(e)
        }
    }
}