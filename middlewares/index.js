module.exports = {
    authMiddleware: require('./auth.middleware'),
    commonMiddleware: require('./common.middleware'),
    fileMiddleware: require('./file.middleware'),
    userMiddleware: require('./user.middleware'),
    ratingMiddleware: require('./rating.middleware'),
    commentMiddleware: require('./comment.middleware'),
    institutionMiddleware: require('./institution.middleware'),
    newsMiddleware: require('./news.middleware'),
    caplMiddleware: require('./capl.middleware'),
    conversationMiddleware: require('./conversation.middleware'),
};