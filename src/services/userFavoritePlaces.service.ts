import {PopulateOptions} from "mongoose";

import {UserFavPlaces} from "../dataBase";
import {IUserFavoritePlaces} from "../interfaces/common";

class UserFavoritePlacesService {
    findOne(params = {}) {
        return UserFavPlaces.findOne(params)
    }

    create(params = {}) {
        return UserFavPlaces.create(params);
    }

    async findWithQuery(_end: number, _start: number, type: string, userId: string, variant: "withData" | "withoutData") {

        const filters = _getByFilter(type, userId);

        const count = await UserFavPlaces.count(filters);

        const items = await UserFavPlaces
            .find(filters)
            .select('_id type item')
            // .lean()
            .skip(_start)
            .limit(_end - _start)
            .sort({["createdAt"]: -1})
            .exec();

        if (variant === 'withData') {
            const elements = await Promise.all(items.map(async (item) => {
                const populate = {
                    path: 'item',
                    select: item.type === 'institution'
                        ? '_id title pictures type place rating averageCheck createdBy reviewsLength'
                        : '_id title pictures place category institutionId description place createdBy status dateEvent',
                    // model: item.type,
                } as PopulateOptions;
                if (item.type === 'institutionNews') {
                    populate.populate = {
                        path: 'institutionId',
                        select: '_id title pictures type'
                    }
                }
                return await item.populate(populate);
            }));
            // for (let item of items) {
            //     const populate = {
            //         path: 'item',
            //         select: item?.type === 'institution'
            //             ? '_id title pictures type place rating averageCheck createdBy reviewsLength'
            //             : '_id title pictures place category institutionId description place createdBy status dateEvent',
            //     } as PopulateOptions;
            //     if (item?.type === 'institutionNews') {
            //         populate.populate = {
            //             path: 'institutionId',
            //             select: '_id title pictures type place rating averageCheck createdBy reviewsLength'
            //         }
            //     }
            //     item = await item.populate(populate);
            //     elements.push(item);
            // }
            return {
                count,
                items: elements
            }
        } else {
            return {
                count,
                items
            }
        }
    }

    deleteOne(params = {}) {
        return UserFavPlaces.deleteOne(params);
    }
}

const _getByFilter = (type: string, userId: string) => {
    const filters: any[] = [];
    const obj = {};

    if (type === 'institution' || type === 'institutionNews') {
        filters.push({
            $or: [
                {type: type}
            ]
        })
    }
    if (userId) {
        filters.push({
            $or: [
                {userId: userId}
            ]
        })
    }

    if (filters.length > 0) {
        Object.assign(obj, {$and: filters})
    }

    return obj;
}

export {
    UserFavoritePlacesService
}