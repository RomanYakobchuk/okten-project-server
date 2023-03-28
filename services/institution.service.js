const {CustomError} = require("../errors");
const {Institution} = require("../dataBase");


module.exports = {
    getWithPagination: async (model, query = {}, _end, _order, _start, _sort, title_like = "", type = "", tags = "", isVerify) => {

        const filterQuery = _getFilterQuery({title_like, type, tags}, isVerify);

        const count = await model.countDocuments({...filterQuery, verify: isVerify && isVerify});

        if (!_sort || !_order) {
            _sort = "createdAt"
            _order = -1
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

    getOneInstitution: (params = {}) => {
        return Institution.findOne(params)
    }
};

//Перевірка на введені пошукові поля

function _getFilterQuery(otherFilter, isVerify) {

    const searchObject = {}

    if (otherFilter.title_like && otherFilter.title_like.length > 0 || otherFilter.type) {
        Object.assign(searchObject, {
            $and: [
                {
                    $or: [
                        {"place.city": {$regex: otherFilter.title_like, $options: 'i'}},
                        {"place.address": {$regex: otherFilter.title_like, $options: 'i'}},
                        {description: {$regex: otherFilter.title_like, $options: "i"}},
                        {title: {$regex: otherFilter.title_like, $options: 'i'}},
                        {features: {$elemMatch: {value: {$regex: otherFilter.title_like, $options: 'i'}}}},
                        {tags: {$elemMatch: {value: {$regex: otherFilter.title_like, $options: 'i'}}}},
                    ]
                },
                {
                    $or: [
                        {type: {$regex: otherFilter.type, $options: 'i'}}
                    ]
                }
            ]

        })
    }
    if (otherFilter.tags) {
        Object.assign(searchObject, {
            $or: [
                {tags: {$elemMatch: {value: {$regex: otherFilter.tags, $options: 'i'}}}},
            ]
        })
    }

    Object.assign(searchObject, {verify: isVerify});

    return searchObject;
}
