import {TUpdateManyCapl} from "../../interfaces/common";

function _getUpdateManyQueryCapl({userId, userStatus}: TUpdateManyCapl) {
    const obj = {};
    const filters: any[] = [];
    const oneHourEarlier = new Date();
    oneHourEarlier.setHours(oneHourEarlier.getHours() - 1);

    filters?.push({
        $or: [
            {
                $and: [
                    {"userStatus.value": "accepted"},
                    {"establishmentStatus.value": "accepted"},
                    {
                        date: {$lt: new Date(oneHourEarlier?.toISOString())}
                    }
                ]
            },
            {
                $and: [
                    {"userStatus.value": "rejected"}, {"establishmentStatus.value": "rejected"}
                ]
            },
        ]
    }, {isActive: true});
    if (userStatus === 'manager' && userId) {
        filters?.push({
            manager: userId
        })
    }
    if (userStatus === 'user' && userId) {
        filters?.push({
            manager: userId
        })
    }
    if (filters.length > 0) {
        Object.assign(obj, {$and: filters});
    }
    return obj;
}

function _getFilterQueryCapl(otherFilter: any, userId: string, type: string) {
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
    _getFilterQueryCapl,
    _getUpdateManyQueryCapl
}