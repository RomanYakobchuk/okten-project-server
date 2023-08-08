import {NextFunction, Response} from "express";

import {CustomRequest} from "../interfaces/func";
import {RatingService} from "../services";
import {CustomError} from "../errors";
import {IInstitution, IOauth, IUser} from "../interfaces/common";

class RatingController {

    private ratingService: RatingService;

    constructor() {
        this.ratingService = new RatingService();

        this.addRating = this.addRating.bind(this);
        this.updateRating = this.updateRating.bind(this);
    }

    async addRating(req: CustomRequest, res: Response, next: NextFunction) {
        try {
            const {grade, institutionId} = req.body;
            const {userId} = req.user as IOauth;
            const user = userId as IUser;
            const institution = req.data_info as IInstitution;

            const myInstitution = user.allInstitutions.includes(institutionId);

            const myUser = institution.createdBy === user?._id && true;

            if (myInstitution || myUser) {
                return next(new CustomError("You cannot rate your own institution", 403))
            }

            const rating = await this.ratingService.createRating({
                createdBy: user?._id,
                grade,
                institutionId
            });

            user.myRatings.push(rating?._id);

            if (institution.rating === 0) {
                institution.rating = institution.rating + grade;
            } else {
                const allPlaceGrade = await this.ratingService.findAllByInstitutionId(institution?._id as string);
                let grades = 0;
                for (const allPlaceGradeElement of allPlaceGrade) {
                    grades += (allPlaceGradeElement?.grade);
                }
                institution.rating = grades / allPlaceGrade?.length;
            }

            await user.save();

            await institution.save();

            const ratings = await this.ratingService.findAllByInstitutionId(institution?._id as string);

            res.status(200).json({
                grade: rating,
                rating: institution.rating,
                ratings: ratings
            });
        } catch (e) {
            next(e);
        }
    }
    async updateRating(req: CustomRequest, res: Response, next: NextFunction) {
        try {
            const {grade, institutionId} = req.body;
            const {userId} = req.user as IOauth;
            const user = userId as IUser;
            const rating = req.rating;
            const institution = req.data_info as IInstitution;

            const myInstitution = user.allInstitutions.includes(institutionId);

            const myUser = institution.createdBy === user?._id && true;

            if (myInstitution || myUser) {
                return next(new CustomError("You cannot rate your own institution", 403))
            }

            rating.grade = grade;
            await rating.save();

            const allPlaceGrade = await this.ratingService.findAllByInstitutionId(institution?._id as string);

            let grades = 0;
            for (const allPlaceGradeElement of allPlaceGrade) {
                grades += (allPlaceGradeElement?.grade);
            }
            institution.rating = grades / allPlaceGrade?.length;

            await institution.save();
            const ratings = await this.ratingService.findAllByInstitutionId(institution?._id as string);

            res.status(200).json({
                grade: rating,
                rating: institution.rating,
                ratings: ratings,
            })

        } catch (e) {
            next(e)
        }
    }
}

export default new RatingController();