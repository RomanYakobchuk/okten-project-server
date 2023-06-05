const {authMiddleware, conversationMiddleware, userMiddleware} = require("../middlewares");
const {messageController} = require("../controllers");
const router = require('express').Router();

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

module.exports = router;