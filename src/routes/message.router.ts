import {Router} from "express";

import {authMiddleware, conversationMiddleware, userMiddleware} from "../middlewares";
import {messageController} from "../controllers";

const router = Router();

router.post(
    `/create`,
    authMiddleware.checkAccessToken,
    messageController.createMessage
)

router.get(
    `/find/:id`,
    authMiddleware.checkAccessToken,
    authMiddleware.checkStatus("check"),
    conversationMiddleware.checkConversation('someInfo'),
    messageController.getMessagesBySenderId
)

router.get(
    `/receiver/:id`,
    authMiddleware.checkAccessToken,
    userMiddleware.isUserPresent,
    messageController.receiverData
)


export default router;