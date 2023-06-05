const {messageService} = require("../services");
const {Message} = require("../dataBase");
module.exports = {
    createMessage: async (req, res, next) => {
        try {
            const {conversationId, sender, text, replyTo} = req.body;
            await messageService.create({
                conversationId,
                sender,
                text,
                replyTo
            });
            // const mes = await messageService.findOne({_id: message?._id}).populate({path: 'sender', select: '_id name avatar'});

            res.status(200).json({message: 'Message send successfully'})
        } catch (e) {
            next(e)
        }
    },
    getMessagesBySenderId: async (req, res, next) => {
        const conversation = req.conversation;
        const {_end, _start, _sort, _order, title_like} = req.query;
        try {

            const count = await Message.MessageSchema.countDocuments({
                conversationId: conversation?._id
            });
            const messages = await messageService
                .findAll({
                    conversationId: conversation?._id
                })
                .populate([
                    {path: 'replyTo', select: '_id sender text', populate: {path: 'sender', select: '_id name'}}
                ])
                .limit(_end - _start)
                .skip(_start)
                .sort({createdAt: -1})
                .exec()

            res.header('x-total-count', count);
            res.header('Access-Control-Expose-Headers', 'x-total-count');

            res.status(200).json(messages)
        } catch (e) {
            next(e)
        }
    },
    receiverData: async (req, res, next) => {
        const user = req.userExist;
        try {
            res.status(200).json({
                _id: user?._id,
                avatar: user?.avatar,
                name: user?.name
            })
        } catch (e) {
            next(e)
        }
    }
}