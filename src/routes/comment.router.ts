import {Router} from 'express';

import {authMiddleware, establishmentMiddleware, commentMiddleware, userMiddleware} from "../middlewares";
import {commentController} from "../controllers";

const router = Router();

// create comment
router.post(
    `/create`,
    authMiddleware.checkAccessToken,
    establishmentMiddleware.checkEstablishment('info'),
    commentMiddleware.checkCreatorIsExist,
    commentController.createComment
)

// all Establishment`s comments
router.get(
    `/allByEstablishmentId/:id`,
    authMiddleware.checkAccessToken,
    establishmentMiddleware.checkEstablishment('info'),
    commentController.allCommentsByEstablishment
)

// all user`s comments
router.get(
    `/allByUserId/:id`,
    authMiddleware.checkAccessToken,
    authMiddleware.checkStatus("check"),
    // userMiddleware.isUserPresent,
    commentController.allCommentsByUserId
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
    establishmentMiddleware.checkEstablishment('info'),
    commentController.allAnsweredCommentById
)


export default router;