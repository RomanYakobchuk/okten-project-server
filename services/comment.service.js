const {Comment} = require("../dataBase");
module.exports = {
    createCommentItem: (comment) => {
        return Comment.CommentItem.create(comment)
    },
    createAnswerComment: (comment) => {
        return Comment.AnswerComment.create(comment)
    },
    getItemsByParams: (params) => {
        return Comment.CommentItem.find(params)
    },
    deleteComment: (id) => {
        return Comment.CommentItem.deleteOne({_id: id});
    },
    deleteAnswerComment: (id) => {
        return Comment.AnswerComment.deleteOne({_id: id});
    },
    getItemByParams: (params) => {
        return Comment.CommentItem.findOne(params)
    },
    getItemAnswerByParams: (params) => {
        return Comment.AnswerComment.findOne(params)
    },
    getAllAnswerComments: async (id, _end, _start) => {
        const count = await Comment.AnswerComment.countDocuments({parentCommentId: id});

        const items = await Comment.AnswerComment
            .find({parentCommentId: id})
            .populate({
                path: 'createdBy',
                select: '_id name avatar'
            })
            .limit(_end - _start)
            .skip(_start)
            .sort({'createdAt': -1})
            .exec();

        return {
            count,
            items
        }
    },
    getWithPagination: async (query = {}, _end, _order, _start, _sort, text_like = "", user = '', institution = '', day_gte = null) => {
        const filterQuery = _getFilterQuery({text_like, day_gte, user, institution});

        const count = await Comment.CommentItem.countDocuments({...filterQuery});

        if (!_sort || !_order) {
            _sort = 'createdAt'
            _order = -1
        }

        _sort = _sort?.split('_')[0];

        const items = await Comment
            .CommentItem
            .find(filterQuery)
            .populate([{path: 'institutionId', select: '_id title type place'}, {
                path: 'createdBy',
                select: '_id name email'
            }])
            .limit(_end - _start)
            .skip(_start)
            .sort({[_sort]: _order})
            .exec();

        return {
            items,
            count
        }
    },
    getAllByPlaceWithPagination: async (id, _end, _start, _sort, _order, type) => {
        if (!_sort || !_order) {
            _sort = "createdAt"
            _order = -1
        }
        if (!_start) {
            _start = 0
        }
        if (!_end) {
            _end = 20
        }
        const newSort = _sort?.split('_')[0];

        const count = await Comment
            .CommentItem
            .countDocuments({[type]: id});


        let items;
        if (type === 'institutionId') {
            items = await Comment
                .CommentItem
                .find({institutionId: id})
                .populate([
                    {path: 'createdBy', select: '_id avatar name'},
                    {path: 'replies', populate: {path: 'createdBy', select: '_id avatar name'}}
                ])
                .limit(_end - _start)
                .skip(_start)
                .sort({[newSort]: _order});
        } else if (type === 'createdBy') {
            items = await Comment
                .CommentItem
                .find({createdBy: id})
                .populate([{path: 'institutionId', select: 'title mainPhoto type _id'}, {
                    path: 'createdBy',
                    select: 'avatar name _id'
                }])
                .limit(_end - _start)
                .skip(_start)
                .sort({[newSort]: _order});
        }
        return {
            items,
            count
        }
    }
}

function _getFilterQuery(otherFilter) {
    const searchObject = {};
    const filterConditions = [];

    if (otherFilter.text_like && otherFilter.text_like.length > 0) {
        filterConditions.push({
            text: {$regex: otherFilter.text_like, $options: 'i'}
        })
    }
    if (otherFilter.institution) {
        filterConditions.push({
            institutionId: otherFilter.institution
        })
    }
    if (otherFilter.user) {
        filterConditions.push({
            createdBy: otherFilter.user
        })
    }
    if (otherFilter.day_gte && otherFilter.day_gte !== "[object Object]") {
        const date = new Date(otherFilter.day_gte);
        const searchDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const nextDay = new Date(searchDay.getTime() + 24 * 60 * 60 * 1000);
        filterConditions.push({
            createdAt: {$gte: searchDay, $lt: nextDay}
        })
    }

    if (filterConditions.length > 0) {
        Object.assign(searchObject, {$and: filterConditions});
    }

    return searchObject;
}