import {Router} from 'express';

import {authMiddleware, institutionMiddleware, commentMiddleware} from "../middlewares";
import {commentController} from "../controllers";

const router = Router();

// create comment
router.post(
    `/create`,
    authMiddleware.checkAccessToken,
    institutionMiddleware.checkInstitution('info'),
    commentMiddleware.checkCreatorIsExist,
    commentController.createComment
)

// all institution`s comments
router.get(
    `/allByInstitutionId/:id`,
    authMiddleware.checkAccessToken,
    institutionMiddleware.checkInstitution('info'),
    commentController.allCommentsByEstablishment
)

// all user`s comments
// router.get(
//     `/allByUserId/:id`,
//     authMiddleware.checkAccessToken,
//     userMiddleware.isUserPresent,
//     commentController.allCommentsByInstitutionUserId('createdBy')
// )

// all comments
router.get(
    `/all_comments`,
    authMiddleware.checkAccessToken,
    authMiddleware.checkStatus('check'),
    commentController.allComments
)

// delete comment
router.delete(
    `/delete/:id`,
    authMiddleware.checkAccessToken,
    commentMiddleware.checkCommentById,
    commentMiddleware.checkCreatorIsExist,
    commentController.deleteComment
)

router.get(
    `/allAnsweredCommentById/:id`,
    authMiddleware.checkAccessToken,
    commentMiddleware.checkCommentById,
    institutionMiddleware.checkInstitution('info'),
    commentController.allAnsweredCommentById
)


export default router;