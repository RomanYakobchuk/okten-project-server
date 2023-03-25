const {InstitutionNews} = require("../dataBase");
module.exports = {
    createNews: (news = {}) => {
        return InstitutionNews.create(news);
    },
    getWithPagination: async (model, query = {}, _end, _order, _start, _sort, title_like = "", type = "", isPublished) => {

        const filterQuery = _getFilterQuery({title_like, type}, isPublished);

        const count = await model.countDocuments({...filterQuery, status: isPublished && "published"});

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

    getOneNews: (params = {}) => {
        return InstitutionNews.findOne(params)
    }
};

//Перевірка на введені пошукові поля

function _getFilterQuery(otherFilter, isPublished) {

    const searchObject = {}

    if (otherFilter.title_like && otherFilter.title_like.length > 0 || otherFilter.type) {
        Object.assign(searchObject, {
            $and: [
                {
                    $or: [
                        {description: {$regex: otherFilter.title_like, $options: "i"}},
                        {title: {$regex: otherFilter.title_like, $options: 'i'}},
                    ]
                },
                {
                    $or: [
                        {category: {$regex: otherFilter.type, $options: 'i'}}
                    ]
                }
            ]

        })
    }

    Object.assign(searchObject, {status: isPublished});

    return searchObject;
}
