const router = require('express').Router();

const {authMiddleware, institutionMiddleware, commentMiddleware, userMiddleware} = require("../middlewares");
const {commentController} = require("../controllers");

// create comment
router.post(
    `/create`,
    authMiddleware.checkAccessToken,
    institutionMiddleware.checkInstitution('info'),
    commentController.createComment
)

// all institution`s comments
router.get(
    `/allByInstitutionId/:id`,
    authMiddleware.checkAccessToken,
    institutionMiddleware.checkInstitution('info'),
    commentController.allCommentsByInstitutionUserId('institutionId')
)

// all user`s comments
router.get(
    `/allByUserId/:id`,
    authMiddleware.checkAccessToken,
    userMiddleware.isUserPresent,
    commentController.allCommentsByInstitutionUserId('createdBy')
)

// all comments
router.get(
    `/all_comments`,
    authMiddleware.checkAccessToken,
    authMiddleware.checkStatus('check'),
    commentController.allComments
)

// delete comment
router.delete(
    `/deleteComment/:id`,
    authMiddleware.checkAccessToken,
    commentMiddleware.checkCommentById,
    commentController.deleteComment
)

router.get(
    `/allAnsweredCommentById/:id`,
    authMiddleware.checkAccessToken,
    commentMiddleware.checkCommentById,
    commentController.allAnsweredCommentById
)

module.exports = router;