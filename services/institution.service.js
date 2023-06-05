const {Institution} = require("../dataBase");


module.exports = {
    getWithPagination: async (
        model,
        query = {},
        _end,
        _order,
        _start,
        _sort,
        title_like = "",
        type = "",
        tags = "",
        isVerify,
        averageCheck_gte = 0,
        averageCheck_lte = 100000,
        city_like,
        userStatus
    ) => {

        const filterQuery = _getFilterQuery({
            title_like,
            type,
            tags,
            averageCheck_gte,
            averageCheck_lte,
            city_like
        }, isVerify);

        let count;
        if (isVerify) {
            count = await model.countDocuments(
                {...filterQuery, verify: isVerify}
            );
        } else {
            count = await model.countDocuments({...filterQuery});
        }

        if (!_sort || !_order) {
            _sort = "createdAt"
            _order = -1
        }
        if (!_start) {
            _start = 0
        }
        if (!_end) {
            _end = 10
        }

        const newSort = _sort?.split('_')[0];

        let items = [];
        if (userStatus === 'admin') {
            items = await model
                .find(filterQuery)
                .select('mainPhoto _id rating type place verify description title createdAt createdBy averageCheck')
                .populate({path: 'views', select: 'viewsNumber'})
                .limit(_end - _start)
                .skip(_start)
                .sort({[newSort]: _order})
                .exec();
        } else {
            items = await model
                .find(filterQuery)
                .select('mainPhoto _id rating type place verify description title createdAt createdBy averageCheck')
                .limit(_end - _start)
                .skip(_start)
                .sort({[newSort]: _order})
                .exec();
        }

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
    },

    getAllByUserParams: async (_end, _start, _sort, _order, userId, verify) => {
        if (!_sort || !_order) {
            _sort = "createdAt"
            _order = -1
        }
        if (!_start) {
            _start = 0
        }
        if (!_end) {
            _end = 5
        }
        const newSort = _sort?.split('_')[0];

        const count = await Institution.countDocuments({createdBy: userId, verify: verify});

        const items = await Institution
            .find({createdBy: userId, verify: verify})
            .select('_id mainPhoto title place averageCheck type rating description createdBy createdAt')
            .limit(_end - _start)
            .skip(_start)
            .sort({[newSort]: _order});

        return {
            items,
            count
        }
    },

    deleteOne: (params) => {
        return Institution.deleteOne(params)
    },

    getUserInstitutionsByQuery: async (search_like = '', createdBy) => {
        const searchObject = {};

        if (createdBy === 'all') {
            Object.assign(searchObject, {
                $and: [
                    {
                        $or: [
                            {title: {$regex: search_like, $options: 'i'}},
                            {description: {$regex: search_like, $options: 'i'}},
                            {'place.address': {$regex: search_like, $options: 'i'}},
                            {'place.city': {$regex: search_like, $options: 'i'}},
                        ],
                    },
                    {verify: 'published'}
                ]
            })
        } else {
            Object.assign(searchObject, {
                $and: [
                    {
                        $or: [
                            {title: {$regex: search_like, $options: 'i'}},
                            {description: {$regex: search_like, $options: 'i'}},
                            {'place.street': {$regex: search_like, $options: 'i'}},
                            {'place.city': {$regex: search_like, $options: 'i'}},
                        ],
                    },
                    {createdBy: createdBy},
                    {verify: 'published'}
                ]
            })
        }
        const institutions = await Institution
            .find(searchObject)
            .select('_id title mainPhoto place')
            .limit(20)
            .sort({['title']: 'asc'})
            .exec();

        return {
            items: institutions
        }
    }
};

//Перевірка на введені пошукові поля

function _getFilterQuery(otherFilter, isVerify) {

    const searchObject = {}

    if (otherFilter.title_like && otherFilter.title_like.length > 0 || otherFilter.type || otherFilter.averageCheck_gte || otherFilter.averageCheck_lte || otherFilter.city_like) {
        Object.assign(searchObject, {
            $and: [
                {
                    $or: [
                        {"place.city": {$regex: otherFilter.title_like, $options: 'i'}},
                        {"place.address": {$regex: otherFilter.title_like, $options: 'i'}},
                        {description: {$regex: otherFilter.title_like, $options: "i"}},
                        {title: {$regex: otherFilter.title_like, $options: 'i'}},
                        {features: {$elemMatch: {value: {$regex: otherFilter.title_like, $options: 'i'}}}},
                    ]
                },
                {
                    $or: [
                        {type: {$regex: otherFilter.type, $options: 'i'}}
                    ]
                },
                {
                    $or: [
                        {averageCheck: {$gte: otherFilter.averageCheck_gte}}
                    ]
                },
                {
                    $or: [
                        {averageCheck: {$lte: otherFilter.averageCheck_lte}}
                    ]
                },
                {
                    $or: [
                        {"place.city": {$regex: otherFilter.city_like, $options: 'i'}}
                    ]
                }
            ]

        })
    }
    if (otherFilter.tags) {
        Object.assign(searchObject, {
            $and: [
                {
                    $or: [
                        {tags: {$elemMatch: {value: {$regex: otherFilter.tags, $options: 'i'}}}},
                    ]
                },
                {
                    $or: [
                        {type: {$regex: otherFilter.type, $options: 'i'}}
                    ]
                },
                {
                    $or: [
                        {averageCheck: {$gte: otherFilter.averageCheck_gte}}
                    ]
                },
                {
                    $or: [
                        {averageCheck: {$lte: otherFilter.averageCheck_lte}}
                    ]
                },
            ]
        })
    }

    if (isVerify) {
        Object.assign(searchObject, {verify: isVerify});
    }

    return searchObject;
}
