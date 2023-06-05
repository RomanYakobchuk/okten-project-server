const {Capl} = require("../dataBase");

module.exports = {
    createReserve: (params) => {
        return Capl.create(params)
    },
    findAll: (params) => {
        return Capl.find(params)
    },
    findOneReserve: (params) => {
        return Capl.findOne(params)
    },
    updateOne: (params, newData) => {
        return Capl.findByIdAndUpdate(params, newData, {new: true});
    },
    findByPagination: async (institution_like = '', day = null, _end, _order, _start, _sort, search_like = '', userStatus = '', institutionStatus = '', userId = '', type = '', query = {}, active) => {

        const filterQuery = _getFilterQuery({
            institution_like,
            day,
            search_like,
            userStatus,
            institutionStatus,
            active
        }, userId, type);

        const count = await Capl.countDocuments({...filterQuery, createdBy: userId});

        if (!_sort || !_order) {
            _sort = "createdAt"
            _order = -1
        }
        _sort = _sort?.split('_')[0];

        const items = await Capl
            .find(filterQuery)
            .populate([{path: 'institution', select: '_id mainPhoto title type place'}])
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

function _getFilterQuery(otherFilter, userId, type) {
    const searchObject = {};
    const filters = [];

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