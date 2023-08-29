import authMiddleware from  './auth.middleware';
import commonMiddleware from  './common.middleware';
import fileMiddleware from  './file.middleware';
import userMiddleware from  './user.middleware';
import commentMiddleware from  './comment.middleware';
import institutionMiddleware from  './institution.middleware';
import newsMiddleware from  './news.middleware';
import caplMiddleware from  './capl.middleware';
import conversationMiddleware from  './conversation.middleware';
import subscribeNotificationMiddleware from  './subscribeNotification.middleware';

export {
    authMiddleware,
    commonMiddleware,
    fileMiddleware,
    userMiddleware,
    commentMiddleware,
    institutionMiddleware,
    newsMiddleware,
    caplMiddleware,
    conversationMiddleware,
    subscribeNotificationMiddleware
}