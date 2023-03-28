const router = require('express').Router();
const {authMiddleware, institutionMiddleware, ratingMiddleware} = require("../middlewares");
const {ratingController} = require("../controllers");

router.post(
    `/addRating`,
    authMiddleware.checkAccessToken,
    institutionMiddleware.checkInstitution,
    ratingController.addRating
)
router.post(
    `/updateRating`,
    authMiddleware.checkAccessToken,
    institutionMiddleware.checkInstitution,
    ratingMiddleware.checkRating,
    ratingController.updateRating
)

module.exports = router;