const router = require('express').Router();

const {authMiddleware, institutionMiddleware} = require("../middlewares");
const {reviewController} = require("../controllers");


router.post(
    `/create`,
    authMiddleware.checkAccessToken,
    institutionMiddleware.checkInstitution,
    reviewController.createReview
)

router.get(
    `/allByInstitutionId/:institutionId`,
    authMiddleware.checkAccessToken,
    institutionMiddleware.checkInstitution,
    reviewController.allReviewByInstitutionId
)


router.get(
    `/allByUserId`,
    authMiddleware.checkAccessToken,
    reviewController.allReviewByUserId
)

router.get(
    `/all_reviews`,
    authMiddleware.checkAccessToken,
    institutionMiddleware.checkInstitution,
    reviewController.allReviews
)

module.exports = router;