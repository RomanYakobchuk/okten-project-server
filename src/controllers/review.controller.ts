import moment from "moment";
import {NextFunction, Response} from "express";

import {CustomRequest} from "../interfaces/func";
import {ReviewService} from "../services";
import {CustomError} from "../errors";
import {ReviewItemSchema} from "../dataBase";
import {IInstitution, IOauth, IUser} from "../interfaces/common";

async function calculateAverageRating(institution: IInstitution) {
    try {
        const pipeline = [
            {
                $match: {institutionId: institution?._id}
            },
            {
                $group: {
                    _id: "",
                    averageRating: {$avg: '$grade'}
                }
            }
        ];

        const result = await ReviewItemSchema.aggregate(pipeline);

        if (result?.length > 0) {
            institution.rating = result[0].averageRating;
            institution.reviewsLength++;
            await institution.save();
        }
    } catch (e) {
        console.log(e)
    }
}

class ReviewController {

    private reviewService: ReviewService;

    constructor() {
        this.reviewService = new ReviewService();

        this.allReviews = this.allReviews.bind(this);
        this.allReviewByInstitutionId = this.allReviewByInstitutionId.bind(this);
        this.latestUserReview = this.latestUserReview.bind(this);
        this.allReviewByUserId = this.allReviewByUserId.bind(this);
        this.createReview = this.createReview.bind(this);
    }

    async allReviews(req: CustomRequest, res: Response, next: NextFunction) {
        try {

        } catch (e) {
            next(e)
        }
    }
    async allReviewByInstitutionId(req: CustomRequest, res: Response, next: NextFunction) {
        const institution = req.data_info;

        const {_order, _sort, _end, _start} = req.query;

        try {

            const {
                items,
                count
            } = await this.reviewService.getAllByPlaceWithPagination(institution?._id as string, Number(_end), Number(_start), _sort, _order, "institutionId", 'createdBy', '_id avatar name');

            res.header('x-total-count', `${count}`);
            res.header('Access-Control-Expose-Headers', 'x-total-count');

            res.status(200).json(items);
        } catch (e) {
            next(e)
        }
    }
    latestUserReview = (type: string) => async (req: CustomRequest, res: Response, next: NextFunction) => {
        const institution = req.data_info as IInstitution;
        const {userId} = req.user as IOauth;
        const user = userId as IUser;
        try {
            const userLatestReview = await this.reviewService
                .getOneByParams({institutionId: institution?._id, createdBy: user?._id})
                .sort({createdAt: -1});

            let isAllowedNewReview: boolean;
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
    }
    async allReviewByUserId(req: CustomRequest, res: Response, next: NextFunction) {
        const {_order, _sort, _end, _start} = req.query;
        const {userId} = req.user as IOauth;
        const user = userId as IUser;
        const userExist = req.userExist;

        try {

            if (userExist?._id?.toString() !== user?._id?.toString() && user?.status !== 'admin') {
                return next(new CustomError("Access denied", 403))
            }

            const {
                items,
                count
            } = await this.reviewService.getAllByPlaceWithPagination(userExist?._id, Number(_end), Number(_start), _sort, _order, "createdBy", "institutionId", 'title pictures type _id');

            res.header('x-total-count', `${count}`);
            res.header('Access-Control-Expose-Headers', 'x-total-count');

            res.status(200).json(items);
        } catch (e) {
            next(e)
        }
    }
    async createReview(req: CustomRequest, res: Response, next: NextFunction) {
        const {grade, text} = req.body;
        const {userId} = req.user as IOauth;
        const user = userId as IUser;
        const institution = req.data_info as IInstitution;
        const isAllowedNewReview = req.isAllowedNewReview;
        try {

            if (!isAllowedNewReview) {
                return next(new CustomError("Allowed block", 403))
            }

            if (institution.createdBy?.toString() === user?._id?.toString()) {
                return next(new CustomError("You cannot evaluate your own institution", 403))
            }

            await this.reviewService.createReview({
                text: text,
                grade,
                createdBy: user?._id,
                institutionId: institution?._id as string
            })

            await calculateAverageRating(institution);

            res.status(200).json({message: 'Review added successfully'})
        } catch (e) {
            next(e)
        }
    }
}

export default new ReviewController();