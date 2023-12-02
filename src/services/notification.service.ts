import {Notification} from "../dataBase";
import {INotification} from "../interfaces/common";

type TGetAllByUser = {
    _end: number,
    _start: number,
    isDelete: boolean,
    _sort: string | any,
    _order: string | number | any,
    title_like: string,
    userId: string,
    status: 'admin' | "manager" | "user" | undefined,
    isReading: string | "null" | "true" | "false"
}
class NotificationService {
    create(params = {}) {
        return Notification.create(params)
    }
    async getUserCount({id, status}: {id: string, status: TGetAllByUser['status']}) {
        const filter = {
            "forUser.role": status
        }
        if (status !== 'admin') {
            filter['forUser.userId'] = id;
            filter['isDelete'] = false
        }
        const countIsNotRead= await Notification.countDocuments({...filter, isRead: false});

        return {
            countIsNotRead
        }
    }

    async getAllByUser({_end, _start, _sort, _order, title_like, userId, status, isReading, isDelete}: TGetAllByUser) {

        const filters = _getAllFilters({otherFilters: {title_like, userId, status, isReading, isDelete}});

        _end = _end ? _end : 20;
        _start = _start ? _start : 0;
        _order = _order ? _order : -1;
        _sort = _sort ? _sort : 'createdAt';

        const countFilter = {
            'forUser.role': status,
            isDelete: isDelete
        }
        // if (isDelete) {
        //     countFilter['isDelete'] = isDelete
        // }
        if (status !== 'admin') {
            countFilter['forUser.userId'] = userId
        }
        // if (isReading !== 'null') {
        //     countFilter['isRead'] = isReading === 'true';
        // }

        // const countIsRead = await Notification.countDocuments({...countFilter, isRead: true});
        // const countIsNotRead = await Notification.countDocuments({...countFilter, isRead: false});
        const count = await Notification.countDocuments({...countFilter});
        const items = await Notification
            .find({...filters, ...countFilter})
            .skip(_start)
            .limit(_end - _start)
            .sort({[_sort]: _order})
            .exec();

        return {
            items,
            // countIsRead,
            // countIsNotRead,
            count
        }
    }
    updateToFromBucket({id, isDelete}:{id: string, isDelete: boolean}) {
        return  Notification.findByIdAndUpdate({_id: id}, {isDelete: isDelete});
    }
    async getOne({_id}: {_id: string}): Promise<INotification | null> {
        return Notification.findOne({_id});
    }
    async deleteOne(id: string) {
        return Notification.deleteOne({_id: id})
    }
}

export {
    NotificationService
}

function _getAllFilters({otherFilters}: { otherFilters: any }) {
    const object = {};
    const filters: any[] = [];

    if (otherFilters.title_like) {
        filters.push({
            $or: [
                {message: {$regex: otherFilters.title_like, $options: 'i'}},
                {description: {$regex: otherFilters.title_like, $options: 'i'}},
            ]
        })
    }
    if (otherFilters.isReading && otherFilters.isReading !== 'null') {
        filters.push({
            $or: [
                {isRead: otherFilters?.isReading === 'true'}
            ]
        })
    }
    if (!!otherFilters.isDelete) {
        filters.push({
            $or: [
                {isDelete: otherFilters.isDelete}
            ]
        })
    }

    if(filters?.length > 0) {
        Object.assign(object, {$and: filters})
    }

    return object;
}