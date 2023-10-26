import {NotificationSchema, SubscribeSchema} from "../dataBase";
import {SortOrder} from "mongoose";

class SubscribeNotificationService {
    getOneSubscribe(institutionId: string, subscriberId: string) {
        return SubscribeSchema.findOne({institutionId: institutionId, subscriberId})
    }
    async createSubscribe(institutionId: string, subscriberId: string) {
        return await SubscribeSchema.create({
            institutionId,
            subscriberId
        })
    }
    deleteSubscribe(institutionId: string, subscriberId: string) {
        return SubscribeSchema.deleteOne({
            institutionId,
            subscriberId
        })
    }
    getOneNotification(subscribeId: string) {
        return NotificationSchema.findOne({subscribeId})
    }

    async getAllSubscribes(id: string, type: 'institutionId' | "subscriberId", _end: number = 40, _start: number = 0, _order: SortOrder = -1, _sort: string = 'createdAt',) {

        const filter = _getFilterQuery({id, type});

        const count = await SubscribeSchema.countDocuments({...filter});

        const items = await SubscribeSchema
            .find({...filter})
            .limit(_end - _start)
            .skip(_start)
            .sort({[_sort]: _order})
            .exec();

        return {
            count,
            items
        }
    }
}

function _getFilterQuery(otherFilter: any) {
    const searchObject = {};
    const filters: any[] = [];

    if (otherFilter.id && otherFilter.type) {
        filters.push({
            $and: [
                {[`${otherFilter.type}`]: otherFilter.id}
            ]
        })
    }
    if (filters.length > 0) {
        Object.assign(searchObject, {$and: filters});
    }

    return searchObject;
}

export {
    SubscribeNotificationService
}