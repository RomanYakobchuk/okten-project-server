const _freeSeatsFilterQuery = (otherFilter: any) => {
    const searchObject = {};

    const filters: any[] = [];
    if (typeof otherFilter.numberOfFreeSeats === 'string') {
        otherFilter.numberOfFreeSeats = Number(otherFilter.numberOfFreeSeats)
    }
    if (typeof otherFilter.numberOfTable === 'string') {
        otherFilter.numberOfFreeSeats = Number(otherFilter.numberOfTable)
    }

    if (otherFilter.numberOfFreeSeats) {
        filters.push({
            $or: [
                {list: {$elemMatch: {numberOfSeats: {$regex: otherFilter.numberOfFreeSeats, $options: 'i'}}}}
            ]
        })
    }
    if (otherFilter.numberOfTable) {
        filters.push({
            $or: [
                {list: {$elemMatch: {table: {$regex: otherFilter.numberOfTable, $options: 'i'}}}}
            ]
        })
    }
    if (otherFilter.typeOfFreeSeats) {
        filters.push({
            $or: [
                {list: {$elemMatch: {status: {$regex: otherFilter.typeOfFreeSeats, $options: 'i'}}}}
            ]
        })
    }
    if (filters?.length > 0) {
        Object.assign(searchObject, {$and: filters})
    }
    return searchObject;
}

const _getFilterQuery = (otherFilter: any, isVerify: string) => {

    const searchObject = {};
    const filters: any[] = [];

    const isTag = otherFilter?.title_like.split('')[0] === '#';

    const tagValue: string = isTag ? otherFilter?.title_like.substring(1, otherFilter.title_like.length) : '';

    if (otherFilter.title_like && otherFilter.title_like.length > 0 && !isTag) {
        filters.push({
            $or: [
                {"place.city": {$regex: otherFilter.title_like, $options: 'i'}},
                {"place.address": {$regex: otherFilter.title_like, $options: 'i'}},
                {description: {$regex: otherFilter.title_like, $options: "i"}},
                {title: {$regex: otherFilter.title_like, $options: 'i'}},
                {features: {$elemMatch: {value: {$regex: otherFilter.title_like, $options: 'i'}}}},
            ]
        })
    }
    if (otherFilter.type) {
        filters.push({
            $or: [
                {type: {$regex: otherFilter.type, $options: 'i'}}
            ]
        })
    }
    if (otherFilter.averageCheck_gte) {
        filters.push({
            $or: [
                {averageCheck: {$gte: Number(otherFilter.averageCheck_gte)}}
            ]
        })
    }
    if (otherFilter.averageCheck_lte) {
        filters.push({
            $or: [
                {averageCheck: {$lte: Number(otherFilter.averageCheck_lte)}}
            ]
        })
    }
    if (otherFilter.city_like && otherFilter.city_like.length >= 0) {
        filters.push({
            $or: [
                {"place.city": {$regex: otherFilter.city_like, $options: 'i'}}
            ]
        })
    }
    if (isTag) {
        filters.push({
            $or: [
                {tags: {$elemMatch: {value: {$regex: tagValue, $options: 'i'}}}},
            ]
        })
    }

    if (isVerify) {
        Object.assign(searchObject, {verify: isVerify});
    }
    if (filters.length > 0) {
        Object.assign(searchObject, {$and: filters})
    }

    return searchObject;
}

export {
    _freeSeatsFilterQuery,
    _getFilterQuery
}
