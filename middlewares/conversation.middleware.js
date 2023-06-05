const {conversationService, institutionService} = require("../services");
const {CustomError} = require("../errors");

module.exports = {
    checkConversation: (type) => async (req, res, next) => {

        const {userId: user} = req.user;
        const {id} = req.params;
        const status = req.newStatus;

        try {
            let conversation;
            if (type === 'allInfo') {
                conversation = await conversationService
                    .getOne({_id: id})
                    .populate([
                        {path: 'userId', select: '_id name avatar'},
                        {path: 'institutionId', select: '_id title mainPhoto'},
                        {path: 'managerId', select: '_id name avatar'}
                    ])
            } else if (type === 'someInfo') {
                conversation = await conversationService.getOne({_id: id});
            }

            if (!conversation) {
                return next(new CustomError("Conversation not found", 404));
            }

            if (status === 'manager') {
                if (conversation?.managerId?._id?.toString() !== user?._id?.toString()) {
                    return next(new CustomError("Access denied", 403))
                }
            }
            if (status === 'user') {
                if (conversation?.userId?._id?.toString() !== user?._id?.toString()) {
                    return next(new CustomError("Access denied", 403))
                }
            }

            req.conversation = conversation;
            next();
        } catch (e) {
            next(e)
        }
    }
}