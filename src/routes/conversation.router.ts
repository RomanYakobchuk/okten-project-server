import {Router} from 'express';

import {conversationController} from "../controllers";
import {authMiddleware, userMiddleware, institutionMiddleware, conversationMiddleware} from "../middlewares";

const router = Router();

router.post(
    `/create`,
    authMiddleware.checkAccessToken,
    userMiddleware.isUserPresent,
    institutionMiddleware.checkInstitution("info"),
    conversationController.createConv
)

router.patch(
    `/updateTitleName/:id`,
    authMiddleware.checkAccessToken,
    authMiddleware.checkStatus('check'),
    conversationMiddleware.checkConversation('someInfo'),
    conversationController.updateTitleName
)

router.get(
    `/findChat`,
    authMiddleware.checkAccessToken,
    authMiddleware.checkStatus('check'),
    conversationController.getConvByUserId
)

router.post(
    `/findChatByTwoId`,
    authMiddleware.checkAccessToken,
    conversationController.getConvTwoUserId
)

router.get(
    `/findById/:id`,
    authMiddleware.checkAccessToken,
    authMiddleware.checkStatus('check'),
    conversationMiddleware.checkConversation('allInfo'),
    conversationController.getConvById
)

export default router;