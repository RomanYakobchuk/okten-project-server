import {CaplSchema} from "../dataBase";
import {CreateReserve, ICapl, TRoles, TUpdateManyCapl} from "../interfaces/common";
import {_getFilterQueryCapl, _getUpdateManyQueryCapl} from "./filters";

interface Repository {
    createReserve(params: CreateReserve): Promise<ICapl>,

    findAll(params: any): Promise<ICapl[]>,

    findOneReserve(params: { _id: string }): Promise<ICapl | null>,

    updateOne(params: any, newData: any): Promise<ICapl | null>,

    findByPagination(establishment_like: string, day: any, _end: number, _order: any | number, _start: number, _sort: any, search_like: string, userStatus: string, establishmentStatus: string, userId: string, type: string, active: "" | "true" | "false"): Promise<{
        count: number,
        items: ICapl[]
    }>,

    updateMany({userId, userStatus}: TUpdateManyCapl): Promise<void>
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

    async updateMany({userId, userStatus}: TUpdateManyCapl) {
        const filterQuery = _getUpdateManyQueryCapl({
            userId,
            userStatus
        });
        await CaplSchema.updateMany(filterQuery, {$set: {isActive: false}});
    }

    async findByPagination(establishment_like: string = '', day = null as any, _end: number, _order: any | number, _start: number, _sort: any, search_like = '', userStatus: string = '', establishmentStatus: string = '', userId: string = '', type: string = '', active: "" | "true" | "false") {

        const filterQuery = _getFilterQueryCapl({
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

        await this.updateMany({
            userId: userId,
            userStatus: userStatus as TRoles
        });

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

export {
    CaplService
}