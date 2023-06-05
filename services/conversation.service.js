const {Message} = require("../dataBase");
const {conversationService} = require("./index");
module.exports = {
    getOne: (params) => {
        return Message.ConversationSchema.findOne(params)
    },
    createConv: (params) => {
        return Message.ConversationSchema.create(params);
    },
    updateOne: (id, params) => {
        return Message.ConversationSchema.updateOne({_id: id}, {...params})
    },
    getAllByUser: async (_end, _start, _sort, _order, type = '', title_like = '', userId = '', institutionId = '', managerId = '') => {

        const _filterQuery = getFilters({institutionId, userId, managerId, type, title_like});
        if (!_sort || !_order) {
            _sort = 'createdAt'
            _order = -1
        }
        const count = await Message.ConversationSchema.countDocuments(_filterQuery)
        const items = await Message.ConversationSchema
            .find(_filterQuery)
            .populate([
                {path: 'institutionId', select: '_id title mainPhoto'},
                {path: 'userId', select: '_id name avatar'},
                {path: 'managerId', select: '_id name avatar'}
            ])
            .limit(_end - _start)
            .skip(_start)
            .sort({[_sort]: _order})
            .exec();

        return {
            items,
            count
        }
    }
}


function getFilters(otherFilter) {
    const searchObject = {};
    const filters = [];

    if (otherFilter.type !== 'admin') {
        if (otherFilter.type === 'user' && otherFilter.userId) {
            filters.push({userId: otherFilter.userId})
        }
        if (otherFilter.type === 'manager' && otherFilter.managerId) {
            filters.push({managerId: otherFilter.managerId})
        }
        if (otherFilter.institutionId && otherFilter.type === 'manager') {
            filters.push(
                {institutionId: otherFilter.institution},
            )
        }
        if (otherFilter.title_like) {
            filters.push({
                $or: [
                    {institutionTitle: {$regex: otherFilter.title_like, $options: 'i'}},
                    {userName: {$regex: otherFilter.title_like, $options: 'i'}},
                ]
            })
        }
    } else if (otherFilter.type === 'admin') {
        if (otherFilter.title_like) {
            filters.push({
                    $or: [
                        {institutionTitle: {$regex: otherFilter.title_like, $options: 'i'}},
                        {userName: {$regex: otherFilter.title_like, $options: 'i'}},]
                },
            )
        }
        if (otherFilter.managerId) {
            filters.push(
                {managerId: otherFilter.managerId}
            )
        }
        if (otherFilter.userId) {
            filters.push(
                {userId: otherFilter.userId}
            )
        }
        if (otherFilter.institutionId) {
            filters.push(
                {institutionId: otherFilter.institutionId}
            )
        }
    }

    if (filters.length > 0) {
        Object.assign(searchObject, {$and: filters})
    }

    return searchObject;
}