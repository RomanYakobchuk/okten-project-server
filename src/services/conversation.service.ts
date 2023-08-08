import {ConversationModel} from "../dataBase";
import { IConvMembers, ILastConvMessage} from "../interfaces/common";
import {Schema} from "mongoose";

interface CreateConv {
    members: IConvMembers[],
    institutionId: Schema.Types.ObjectId,
    userName: string,
    institutionTitle: string,
    lastMessage: ILastConvMessage,
}
class ConversationService {
    getOne(params: any) {
        return ConversationModel.findOne(params)
    }
    createConv(params: CreateConv) {
        return ConversationModel.create(params);
    }
    updateOne(id: string, params: any) {
        return ConversationModel.updateOne({_id: id}, {...params})
    }
    async getAllByUser(_end: number, _start: number, _sort: any, _order: any, type: string = '', title_like: string = '', userId: string = '', institutionId: string = '') {

        const _filterQuery = getFilters({userId, institutionId, type, title_like});
        if (!_sort || !_order) {
            _sort = 'createdAt'
            _order = -1
        }
        const count = await ConversationModel.countDocuments(_filterQuery)
        const items = await ConversationModel
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


function getFilters(otherFilter: any) {
    const searchObject = {};
    const filters: any[] = [];

    if (otherFilter.type !== 'admin') {
        if (otherFilter.userId) {
            filters.push({members: {$elemMatch: {user: otherFilter.userId}}})
        }
        if (otherFilter.institutionId && otherFilter.type === 'manager') {
            filters.push(
                {institutionId: otherFilter.institutionId},
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

export {
    ConversationService
}