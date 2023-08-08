import {Router} from "express";

import {authMiddleware, institutionMiddleware, userMiddleware} from "../middlewares";
import {reviewController} from "../controllers";

const router = Router();

// create review
router.post(
    `/create`,
    authMiddleware.checkAccessToken,
    institutionMiddleware.checkInstitution('info'),
    reviewController.latestUserReview('check'),
    reviewController.createReview
)

// all institution`s review
router.get(
    `/allByInstitutionId/:id`,
    authMiddleware.checkAccessToken,
    institutionMiddleware.checkInstitution('info'),
    reviewController.allReviewByInstitutionId
)

router.get(
    `/latestUserReview/:id`,
    authMiddleware.checkAccessToken,
    institutionMiddleware.checkInstitution('info'),
    reviewController.latestUserReview('info')
)

// all user`s review
router.get(
    `/allByUserId/:id`,
    authMiddleware.checkAccessToken,
    userMiddleware.isUserPresent,
    reviewController.allReviewByUserId
)

// all review
router.get(
    `/all_reviews`,
    authMiddleware.checkAccessToken,
    reviewController.allReviews
)


export default router;