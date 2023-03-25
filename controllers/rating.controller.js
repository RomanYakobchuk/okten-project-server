const {ratingService} = require("../services");
const {CustomError} = require("../errors");

module.exports = {
    addRating: async (req, res, next) => {
        try {
            const {grade, institutionId} = req.body;
            const {userId: user} = req.user;
            const institution = req.institution;

            const myInstitution = user.allInstitutions.includes(institutionId);

            const myUser = institution.createdBy === user?._id && true;

            if (myInstitution || myUser) {
                return next(new CustomError("You cannot rate your own institution", 403))
            }

            const rating = await ratingService.createRating({
                createdBy: user?._id,
                grade,
                institutionId
            });

            user.myRatings.push(rating?._id);

            institution.ratings.push(rating?._id);

            if (institution.rating === 0) {
                institution.rating = institution.rating + grade;
            } else {
                const allPlaceGrade = await ratingService.findAllByInstitutionId(institution?._id);
                let grades = 0;
                for (const allPlaceGradeElement of allPlaceGrade) {
                    grades += (allPlaceGradeElement?.grade);
                }
                institution.rating = grades / allPlaceGrade?.length;
            }

            await user.save();
            await institution.save();

            res.status(200).json({
                grade: rating,
                rating: institution.rating,
                ratings: institution.ratings
            });
        } catch (e) {
            next(e);
        }
    },

    updateRating: async (req, res, next) => {
        try {
            const {grade, institutionId} = req.body;
            const {userId: user} = req.user;
            const rating = req.rating;
            const institution = req.institution;

            const myInstitution = user.allInstitutions.includes(institutionId);

            const myUser = institution.createdBy === user?._id && true;

            if (myInstitution || myUser) {
                return next(new CustomError("You cannot rate your own institution", 403))
            }

            rating.grade = grade;
            await rating.save();

            const allPlaceGrade = await ratingService.findAllByInstitutionId(institution?._id);

            let grades = 0;
            for (const allPlaceGradeElement of allPlaceGrade) {
                grades += (allPlaceGradeElement?.grade);
            }
            institution.rating = grades / allPlaceGrade?.length;

            await institution.save();

            res.status(200).json({
                grade: rating,
                rating: institution.rating,
                ratings: institution.ratings,
            })

        } catch (e) {
            next(e)
        }
    }
}