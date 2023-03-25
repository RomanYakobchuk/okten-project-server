const {ratingService} = require("../services");
const {CustomError} = require("../errors");
module.exports = {
    checkRating: async (req, res, next) => {
        try {
            const {ratingId} = req.body;

            const rating = await ratingService.findOneRating({_id: ratingId});

            if (!rating) {
                return next(new CustomError('Rating not found'));
            }

            req.rating = rating;

            next()
        } catch (e) {
            next(e)
        }
    }
}