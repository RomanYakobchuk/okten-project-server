const {CustomError} = require("../errors");
const {Institution} = require("../dataBase");


module.exports = {
    getOne: async (params = {}) => {
        return Institution.findOne(params)
    },
    getWithPagination: async (model, query = {}, _end, _order, _start, _sort, title_like = "", type = "") => {

        const filterQuery = _getFilterQuery({title_like, type});

        const count = await model.countDocuments({...filterQuery, verify: true});

        if(!_sort) {
            _sort = "createdAt"
        }
        const items = await model
            .find(filterQuery)
            .limit(_end)
            .skip(_start)
            .sort({[_sort]: _order})
            .exec();

        return {
            count,
            items
        }
    },

    createInstitution: (institution) => {
        return Institution.create(institution);
    },

    getOneInstitution: (params) => {
        return Institution.findOne(params)
    }
};

//Перевірка на введені пошукові поля

function _getFilterQuery(otherFilter) {

    const searchObject = {}

    if (otherFilter.title_like) {
        Object.assign(searchObject, {
            $or: [
                {city: {$regex: otherFilter.title_like, $options: 'i'}},
                {type: {$regex: otherFilter.title_like, $options: 'i'}},
                {description: {$regex: otherFilter.title_like, $options: "i"}},
                {title: {$regex: otherFilter.title_like, $options: 'i'}},
                {features: { $elemMatch: { value: {$regex: otherFilter.title_like, $options: 'i'}}}},
                {tags:{ $elemMatch: { value: {$regex: otherFilter.title_like, $options: 'i'}}}},
            ]
        })
    } else if (otherFilter.type) {
        Object.assign(searchObject, {
            $or: [
                {type: {$regex: otherFilter.type, $options: 'i'}}
            ]
        })
    }

    Object.assign(searchObject, {verify: true});

    return searchObject;
}

//Перевірка на вірність введення номеру сторінки і кількості елементів на сторінці

function _pageFilter(page, perPage) {
    if (page <= 0) {
        throw new CustomError('Page not found, page must be greater than 0', 404);
    }

    if (/^[a-zA-Z]+$/.test(page)) {
        throw new CustomError('Page should be a number', 404);
    }
    if (perPage <= 0) {
        throw new CustomError('PerPage must be greater than 0', 404);
    }

    if (/^[a-zA-Z]+$/.test(perPage)) {
        throw new CustomError('PerPage should be a number', 404);
    }

    return {
        page,
        perPage
    }
}