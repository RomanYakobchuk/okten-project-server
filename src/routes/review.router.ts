import {Router} from "express";

import {authMiddleware, establishmentMiddleware, userMiddleware} from "../middlewares";
import {reviewController} from "../controllers";

const router = Router();

// create review
router.post(
    `/create`,
    authMiddleware.checkAccessToken,
    establishmentMiddleware.checkEstablishment('info'),
    reviewController.latestUserReview('check'),
    reviewController.createReview
)

// all Establishment`s review
router.get(
    `/allByEstablishmentId/:id`,
    authMiddleware.checkAccessToken,
    establishmentMiddleware.checkEstablishment('info'),
    reviewController.allReviewByEstablishmentId
)

router.get(
    `/latestUserReview/:id`,
    authMiddleware.checkAccessToken,
    establishmentMiddleware.checkEstablishment('info'),
    reviewController.latestUserReview('info')
)

// all user`s review
router.get(
    `/allByUserId/:id`,
    authMiddleware.checkAccessToken,
    authMiddleware.checkStatus("check"),
    // userMiddleware.isUserPresent,
    reviewController.allReviewByUserId
)

// all review
router.get(
    `/all_reviews`,
    authMiddleware.checkAccessToken,
    reviewController.allReviews
)


export default router;