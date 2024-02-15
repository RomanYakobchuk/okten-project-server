import moment from "moment";
import {NextFunction, Response} from "express";

import {CustomRequest} from "../interfaces/func";
import {isProfaneText, ReviewService} from "../services";
import {CustomError} from "../errors";
import {ReviewItemSchema} from "../dataBase";
import {IEstablishment, IOauth, IUser} from "../interfaces/common";

async function calculateAverageRating(establishment: IEstablishment) {
    try {
        const pipeline = [
            {
                $match: {establishmentId: establishment?._id}
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
            establishment.rating = result[0].averageRating;
            establishment.reviewsLength++;
            await establishment.save();
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
        this.allReviewByEstablishmentId = this.allReviewByEstablishmentId.bind(this);
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

    async allReviewByEstablishmentId(req: CustomRequest, res: Response, next: NextFunction) {
        const establishment = req.data_info;

        const {_order, _sort, _end, _start} = req.query;

        try {

            const {
                items,
                count
            } = await this.reviewService.getAllByPlaceWithPagination(establishment?._id as string, Number(_end), Number(_start), _sort, _order, "establishmentId", 'createdBy', '_id avatar name');

            res.header('x-total-count', `${count}`);
            res.header('Access-Control-Expose-Headers', 'x-total-count');

            res.status(200).json(items);
        } catch (e) {
            next(e)
        }
    }

    latestUserReview = (type: string) => async (req: CustomRequest, res: Response, next: NextFunction) => {
        const establishment = req.data_info as IEstablishment;
        const {userId} = req.user as IOauth;
        const user = userId as IUser;
        try {
            const userLatestReview = await this.reviewService
                .getOneByParams({establishmentId: establishment?._id, createdBy: user?._id})
                .sort({createdAt: -1});

            let isAllowedNewReview: boolean;
            if (userLatestReview) {
                const oneWeekAgo = moment().subtract(3, 'days');
                if (type === 'check') {
                    isAllowedNewReview = moment(userLatestReview.createdAt).isBefore(oneWeekAgo);
                    req.isAllowedNewReview = isAllowedNewReview;
                    return next();
                } else if (type === 'info') {
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
        const {id} = req.params;
        const user = userId as IUser;
        const status = req.newStatus;

        try {

            if (user?._id?.toString() !== id && status !== 'admin') {
                return next(new CustomError("Access denied", 403))
            }

            const {
                items,
                count
            } = await this.reviewService.getAllByPlaceWithPagination(id, Number(_end), Number(_start), "createdAt", -1, "createdBy", "createdBy", '_id name avatar');

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
        const establishment = req.data_info as IEstablishment;
        const isAllowedNewReview = req.isAllowedNewReview;
        try {

            if (!isAllowedNewReview) {
                return next(new CustomError("Allowed block", 403))
            }
            if (establishment.createdBy?.toString() === user?._id?.toString()) {
                return next(new CustomError("You cannot evaluate your own establishment", 403))
            }
            const isProfane1 = isProfaneText(text.like);
            const isProfane2 = isProfaneText(text.notLike);
            if (isProfane1 || isProfane2) {
                return next(new CustomError('Your comment includes bad words!!!', 400))
            }

            await this.reviewService.createReview({
                text: text,
                grade,
                createdBy: user?._id as string,
                establishmentId: establishment?._id as string
            })

            await calculateAverageRating(establishment);

            res.status(200).json({message: 'Review added successfully'})
        } catch (e) {
            next(e)
        }
    }
}

export default new ReviewController();