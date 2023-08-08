import {NextFunction, Response} from "express";

import {RatingService} from "../services";
import {CustomError} from "../errors";
import {CustomRequest} from "../interfaces/func";

class RatingMiddleware {
    private ratingService: RatingService;

    constructor() {
        this.ratingService = new RatingService();

        this.checkRating = this.checkRating.bind(this);
    }

    async checkRating(req: CustomRequest, res: Response, next: NextFunction) {
        try {
            const {ratingId} = req.body;

            const rating = await this.ratingService.findOneRating({_id: ratingId});

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

export default new RatingMiddleware();