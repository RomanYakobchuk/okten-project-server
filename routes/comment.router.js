const router = require('express').Router();

const {authMiddleware, institutionMiddleware} = require("../middlewares");
const {commentController} = require("../controllers");


router.post(
    `/create`,
    authMiddleware.checkAccessToken,
    institutionMiddleware.checkInstitution,
    commentController.createComment
)

router.get(
    `/allByInstitutionId/:institutionId`,
    authMiddleware.checkAccessToken,
    institutionMiddleware.checkInstitution,
    commentController.allCommentsByInstitutionId
)


router.get(
    `/allByUserId`,
    authMiddleware.checkAccessToken,
    commentController.allCommentsByUserId
)

router.get(
    `/all_comments`,
    authMiddleware.checkAccessToken,
    institutionMiddleware.checkInstitution,
    commentController.allComments
)

module.exports = router;