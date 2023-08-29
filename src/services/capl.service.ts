import {CaplSchema} from "../dataBase";
import {CreateReserve, ICapl} from "../interfaces/common";


interface Repository {
    createReserve(params: CreateReserve): Promise<ICapl>,
    findAll(params: any): Promise<ICapl[]>,
    findOneReserve(params: {_id: string}): Promise<ICapl | null>,
    updateOne(params: any, newData: any): Promise<ICapl | null>,
    findByPagination(institution_like: string, day: any, _end: number, _order: any | number, _start: number, _sort: any, search_like: string, userStatus: string, institutionStatus: string, userId: string, type: string, active: boolean): Promise<{count: number, items: ICapl[]}>
}

class CaplService implements Repository {
    createReserve(params: CreateReserve) {
        return CaplSchema.create(params)
    }

    findAll(params: any) {
        return CaplSchema.find(params)
    }

    findOneReserve(params: { _id: string }) {
        return CaplSchema.findOne(params)
    }

    updateOne(params: any, newData: any) {
        return CaplSchema.findByIdAndUpdate(params, newData, {new: true});
    }

    async findByPagination(institution_like: string = '', day = null as any, _end: number, _order: any | number, _start: number, _sort: any, search_like = '', userStatus: string = '', institutionStatus: string = '', userId: string = '', type: string = '', active: boolean) {

        const filterQuery = _getFilterQuery({
            institution_like,
            day,
            search_like,
            userStatus,
            institutionStatus,
            active
        }, userId, type);

        const count = await CaplSchema.countDocuments({...filterQuery, createdBy: userId});

        if (!_sort || !_order) {
            _sort = "createdAt"
            _order = -1
        }
        _sort = _sort?.split('_')[0];

        const items = await CaplSchema
            .find(filterQuery)
            .populate([{path: 'institution', select: '_id pictures title type place'}])
            .limit(_end - _start)
            .skip(_start)
            .sort({[_sort]: _order})
            .exec()

        return {
            items,
            count
        }
    }
}
// export const caplService = {
//     createReserve: (params: any) => {
//         return CaplSchema.create(params)
//     },
//     findAll: (params: any) => {
//         return CaplSchema.find(params)
//     },
//     findOneReserve: (params: any) => {
//         return CaplSchema.findOne(params)
//     },
//     updateOne: (params: any, newData: any) => {
//         return CaplSchema.findByIdAndUpdate(params, newData, {new: true});
//     },
//     findByPagination: async (institution_like: string = '', day = null as any, _end: number, _order: any | number, _start: number, _sort: any, search_like = '', userStatus: string = '', institutionStatus: string = '', userId: string = '', type: string = '', query: {} = {}, active: boolean) => {
//
//         const filterQuery = _getFilterQuery({
//             institution_like,
//             day,
//             search_like,
//             userStatus,
//             institutionStatus,
//             active
//         }, userId, type);
//
//         const count = await CaplSchema.countDocuments({...filterQuery, createdBy: userId});
//
//         if (!_sort || !_order) {
//             _sort = "createdAt"
//             _order = -1
//         }
//         _sort = _sort?.split('_')[0];
//
//         const items = await CaplSchema
//             .find(filterQuery)
//             .populate([{path: 'institution', select: '_id mainPhoto title type place'}])
//             .limit(_end - _start)
//             .skip(_start)
//             .sort({[_sort]: _order})
//             .exec()
//
//         return {
//             items,
//             count
//         }
//     }
// }

function _getFilterQuery(otherFilter: any, userId: string, type: string) {
    const searchObject = {};
    const filters: any[] = [];

    if (otherFilter.search_like) {
        filters.push({
            $or: [
                {fullName: {$regex: otherFilter.search_like, $options: 'i'}},
                {description: {$regex: otherFilter.search_like, $options: 'i'}},
                {whoPay: {$regex: otherFilter.search_like, $options: 'i'}},
                {eventType: {$regex: otherFilter.search_like, $options: 'i'}},
            ]
        },)
    }
    if (otherFilter.userStatus) {
        filters.push({
            $or: [
                {'userStatus.value': {$regex: otherFilter.userStatus, $options: 'i'}}
            ]
        })
    }
    if (otherFilter.institutionStatus) {
        filters.push({
            $or: [
                {'institutionStatus.value': {$regex: otherFilter.institutionStatus, $options: 'i'}}
            ]
        },)
    }
    if (otherFilter.institution_like) {
        filters.push({institution: otherFilter.institution_like})
    }
    if (otherFilter.active) {
        filters.push({
            $or: [
                {"reserved.isReserved": {$regex: otherFilter.isReserved, $options: 'i'}}
            ]
        },)
    }
    if (otherFilter.day && otherFilter.day !== "[object Object]") {
        const date = new Date(otherFilter.day);
        const searchDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const nextDay = new Date(searchDay.getTime() + 24 * 60 * 60 * 1000);
        filters.push({
            date: {$gte: searchDay, $lt: nextDay}
        })
    }
    if (otherFilter.active) {
        filters.push({
            isActive: otherFilter.active
        })
    }

    if (filters.length > 0) {
        Object.assign(searchObject, {$and: filters});
    }

    if (userId && type === 'user') {
        Object.assign(searchObject, {user: userId});
    } else if (userId && type === 'manager') {
        Object.assign(searchObject, {manager: userId})
    }

    return searchObject
}

export {
    CaplService
}