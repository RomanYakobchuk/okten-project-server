import {ConversationModel} from "../dataBase";
import {IConvMembers, ILastConvMessage, IConversation} from "../interfaces/common";
import {Schema} from "mongoose";

interface CreateConv {
    members: IConvMembers[],
    lastMessage?: ILastConvMessage,
    chatInfo: IConversation['chatInfo']
}

class ConversationService {
    getOne(params: any) {
        return ConversationModel.findOne(params)
    }

    deleteOne(params = {}) {
        return ConversationModel.deleteOne(params);
    }
    createConv(params: CreateConv) {
        return ConversationModel.create(params);
    }

    updateOne(id: string, params: any) {
        return ConversationModel.updateOne({_id: id}, {...params})
    }

    async getAllByUser(_end: number, _start: number, _sort: any, _order: any, type: string = '', title_like: string = '', userId: string = '', establishmentId: string = '') {

        const _filterQuery = getFilters({userId, establishmentId: establishmentId, type, title_like});
        if (!_sort || !_order) {
            _sort = 'createdAt'
            _order = -1
        }
        const count = await ConversationModel.countDocuments(_filterQuery).exec();
        const items = await ConversationModel
            .find(_filterQuery)
            .populate([
                // {path: 'establishmentId', select: '_id title pictures', options: {limit: 1}},
                // {path: 'members.user', select: '_id name avatar'},
                {path: 'chatInfo.field.id'},
                {path: 'members.user', select: '_id avatar name uniqueIndicator'}
                // {path: 'creator', select: "_id name avatar status"},
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


function getFilters(otherFilter: any) {
    const searchObject = {};
    const filters: any[] = [];

    if (otherFilter.userId) {
        filters.push({members: {$elemMatch: {user: otherFilter.userId}}})
    }
    // if (otherFilter.establishmentId && otherFilter.type === 'manager') {
    //     filters.push(
    //         {establishmentId: otherFilter.establishmentId},
    //     )
    // }
    // if (otherFilter.title_like) {
    //     filters.push({
    //         $or: [
    //             {establishmentTitle: {$regex: otherFilter.title_like, $options: 'i'}},
    //             {userName: {$regex: otherFilter.title_like, $options: 'i'}},
    //         ]
    //     })
    // }
    //
    // if (otherFilter.title_like) {
    //     filters.push({
    //             $or: [
    //                 {establishmentTitle: {$regex: otherFilter.title_like, $options: 'i'}},
    //                 {userName: {$regex: otherFilter.title_like, $options: 'i'}},]
    //         },
    //     )
    // }

    // if (otherFilter.establishmentId) {
    //     filters.push(
    //         {establishmentId: otherFilter.establishmentId}
    //     )
    // }

    if (filters.length > 0) {
        Object.assign(searchObject, {$and: filters})
    }

    return searchObject;
}

export {
    ConversationService
}