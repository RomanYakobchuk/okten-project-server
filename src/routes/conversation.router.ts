import {Router} from 'express';

import {conversationController} from "../controllers";
import {
    authMiddleware,
    userMiddleware,
    institutionMiddleware,
    conversationMiddleware,
    commonMiddleware
} from "../middlewares";

const router = Router();

router.post(
    `/create`,
    authMiddleware.checkAccessToken,
    commonMiddleware.parseJsonStrings,
    userMiddleware.isUserPresent('userId'),
    conversationController.createConv()
)
router.post(
    `/createOwnChat`,
    authMiddleware.checkAccessToken,
    commonMiddleware.parseJsonStrings,
    conversationMiddleware.conversationOneByOneExist(),
    // conversationMiddleware.checkConversation("allInfo"),
    conversationController.createOwnChat
)

router.patch(
    `/updateTitleName/:id`,
    authMiddleware.checkAccessToken,
    authMiddleware.checkStatus('check'),
    conversationMiddleware.checkConversation('someInfo'),
    conversationController.updateTitleName
)

router.get(
    `/findChat/:id`,
    authMiddleware.checkAccessToken,
    userMiddleware.isUserPresent('userId'),
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

router.delete(
    `/deleteChat/:id`,
    authMiddleware.checkAccessToken,
    authMiddleware.checkStatus('check'),
    conversationMiddleware.checkConversation('someInfo'),
    conversationController.deleteChat
)

export default router;