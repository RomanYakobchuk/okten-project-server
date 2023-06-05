const {conversationService} = require("../services");
module.exports = {
    createConv: async (req, res, next) => {
        const user = req.userExist;
        const institution = req.data_info;
        try {
            const conv = await conversationService.getOne({
                userId: user?._id,
                managerId: institution?.createdBy,
                institutionId: institution?._id
            });

            if (conv) {
                res.status(400).json('Conversation is exist');
            } else {
                const newConv = await conversationService.createConv({
                    userId: user?._id,
                    institutionId: institution?._id,
                    managerId: institution?.createdBy,
                    userName: user?.name,
                    institutionTitle: institution?.title
                });

                res.status(200).json(newConv);
            }
        } catch (e) {
            next(e)
        }
    },
    getConvByUserId: async (req, res, next) => {
        const {_end, _start, _sort, _order, title_like, userId, institutionId, managerId} = req.query;
        const {userId: user} = req.user;
        try {
            const {
                items,
                count
            } = await conversationService.getAllByUser(_end, _start, _sort, _order, user?.status, title_like, userId, institutionId, managerId);

            res.header('x-total-count', count);
            res.header('Access-Control-Expose-Headers', 'x-total-count');

            res.status(200).json(items);
        } catch (e) {
            next(e)
        }
    },

    getConvTwoUserId: async (req, res, next) => {
        try {
            const {userId, institutionId} = req.body;

            const conv = await conversationService
                .getOne({userId, institutionId})
                .populate([
                    {path: 'userId', select: '_id avatar name'},
                    {path: 'institutionId', select: '_id title mainPhoto'},
                    {path: 'managerId', select: '_id name avatar'}
                ]);

            res.status(200).json(conv);
        } catch (e) {
            next(e)
        }
    },
    updateTitleName: async (req, res, next) => {
        const conversation = req.conversation;
        const {newName, newTitle} = req.body;
        const status = req.newStatus;
        try {
            if (status === 'admin' || status === 'manager') {
                conversation.userName = newName
            }
            if (status === 'admin' || status === 'user') {
                conversation.institutionTitle = newTitle
            }
            await conversation.save();

            res.status(200).json({message: 'Value updated successfully'});
        } catch (e) {
            next(e)
        }
    },
    getConvById: async (req, res, next) => {
        const conversation = req.conversation;
        try {
            res.status(200).json(conversation)
        } catch (e) {
            next(e)
        }
    }
}