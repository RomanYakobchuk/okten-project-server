import {CommentItemSchema, AnswerCommentSchema} from "../dataBase";
import {IAnswerComment, IComment, ICreateCommentItem} from "../interfaces/common";

interface Repository {
    createCommentItem(comment: ICreateCommentItem): Promise<IComment>,
    createAnswerComment(comment: any): Promise<IAnswerComment>,
    getItemsByParams(params: any): Promise<IComment[]>,
    getItemByParams(params: any): Promise<IComment | null>,
    getWithPagination( _end: number, _order: any, _start: number, _sort: any, text_like: string, user: string, institution: string, day_gte: any): Promise<{count: number, items: IComment[]}>
    getAllByPlaceWithPagination(id: string, _end: number, _start: number, _sort: any, _order: any, type: string): Promise<{count: number, items: IComment[]}>
}
class CommentService implements Repository {
    createCommentItem(comment: ICreateCommentItem) {
        return CommentItemSchema.create(comment)
    }
    createAnswerComment(comment: any) {
        return AnswerCommentSchema.create(comment)
    }
    getItemsByParams(params: any) {
        return CommentItemSchema.find(params)
    }
    deleteComment(id: string) {
        return CommentItemSchema.deleteOne({_id: id});
    }
    deleteAnswerComment(id: string) {
        return AnswerCommentSchema.deleteOne({_id: id});
    }
    getItemByParams(params: any) {
        return CommentItemSchema.findOne(params)
    }
    getItemAnswerByParams(params: any) {
        return AnswerCommentSchema.findOne(params)
    }
    async getAllAnswerComments(id: string, _end: number, _start: number) {
        const count = await AnswerCommentSchema.countDocuments({parentCommentId: id});

        const items = await AnswerCommentSchema
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
    }
    async getWithPagination( _end: number, _order: any, _start: number, _sort: any, text_like: string = "", user = '', institution = '', day_gte: any = null) {
        const filterQuery = _getFilterQuery({text_like, day_gte, user, institution});

        const count = await CommentItemSchema.countDocuments({...filterQuery});

        if (!_sort || !_order) {
            _sort = 'createdAt'
            _order = -1
        }

        _sort = _sort?.split('_')[0];

        const items = await CommentItemSchema
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
    }
    async getAllByPlaceWithPagination(id: string, _end: number, _start: number, _sort: any, _order: any, type: string) {
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

        const count = await CommentItemSchema.countDocuments({[type]: id});

        let items;
        if (type === 'institutionId') {
            items = await CommentItemSchema
                .find({institutionId: id})
                .populate([
                    {path: 'createdBy', select: '_id avatar name'},
                    {path: 'replies', populate: {path: 'createdBy', select: '_id avatar name'}}
                ])
                .limit(_end - _start)
                .skip(_start)
                .sort({[newSort]: _order});
        } else if (type === 'createdBy') {
            items = await CommentItemSchema
                .find({createdBy: id})
                .populate([{path: 'institutionId', select: 'title pictures type _id'}, {
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

function _getFilterQuery(otherFilter: any) {
    const searchObject = {};
    const filterConditions: any[] = [];

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

export {
    CommentService
}