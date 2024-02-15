import {CaplSchema} from "../dataBase";
import {CreateReserve, ICapl} from "../interfaces/common";


interface Repository {
    createReserve(params: CreateReserve): Promise<ICapl>,

    findAll(params: any): Promise<ICapl[]>,

    findOneReserve(params: { _id: string }): Promise<ICapl | null>,

    updateOne(params: any, newData: any): Promise<ICapl | null>,

    findByPagination(establishment_like: string, day: any, _end: number, _order: any | number, _start: number, _sort: any, search_like: string, userStatus: string, establishmentStatus: string, userId: string, type: string, active: "" | "true" | "false"): Promise<{
        count: number,
        items: ICapl[]
    }>
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

    async findByPagination(establishment_like: string = '', day = null as any, _end: number, _order: any | number, _start: number, _sort: any, search_like = '', userStatus: string = '', establishmentStatus: string = '', userId: string = '', type: string = '', active: "" | "true" | "false") {

        const filterQuery = _getFilterQuery({
            establishment_like: establishment_like,
            day,
            search_like: search_like?.trim(),
            userStatus,
            establishmentStatus: establishmentStatus,
            active
        }, userId, type);

        const count = await CaplSchema.countDocuments({...filterQuery});

        if (!_sort || !_order) {
            _sort = "date"
            _order = -1
        }
        _sort = _sort?.split('_')[0];

        const items = await CaplSchema
            .find(filterQuery)
            .populate([{path: 'establishment', select: '_id pictures title type place'}])
            .limit(_end - _start)
            .skip(_start)
            .sort({[_sort]: _order})
            .exec()

        for (const item of items) {
            const myDate = new Date(item?.date);
            const currentDate = new Date();
            if (((item?.userStatus?.value === 'accepted' && myDate < currentDate) || (item?.userStatus?.value === 'rejected' && item?.establishmentStatus?.reasonRefusal)) && item?.establishmentStatus?.value === 'rejected') {
                item.isActive = false;
                await item.save();
            }
        }
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
//     findByPagination: async (establishment_like: string = '', day = null as any, _end: number, _order: any | number, _start: number, _sort: any, search_like = '', userStatus: string = '', establishmentStatus: string = '', userId: string = '', type: string = '', query: {} = {}, active: boolean) => {
//
//         const filterQuery = _getFilterQuery({
//             establishment_like,
//             day,
//             search_like,
//             userStatus,
//             establishmentStatus,
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
//             .populate([{path: 'establishment', select: '_id mainPhoto title type place'}])
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
    if (otherFilter.establishmentStatus) {
        filters.push({
            $or: [
                {'establishmentStatus.value': {$regex: otherFilter.establishmentStatus, $options: 'i'}}
            ]
        },)
    }
    if (otherFilter.establishment_like) {
        filters.push({establishment: otherFilter.establishment_like})
    }
    // if (otherFilter.active) {
    //     filters.push({
    //         $or: [
    //             {"isActive": {$regex: otherFilter.active, $options: 'i'}}
    //         ]
    //     },)
    // }
    if (otherFilter.day && otherFilter.day !== "[object Object]") {
        const date = new Date(otherFilter.day);
        const searchDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const nextDay = new Date(searchDay.getTime() + 24 * 60 * 60 * 1000);
        filters.push({
            date: {$gte: searchDay, $lt: nextDay}
        })
    }
    if (otherFilter.active === "true" || otherFilter.active === "false") {
        filters.push({
            isActive: otherFilter.active === 'true'
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