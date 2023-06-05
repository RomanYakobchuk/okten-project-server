const {InstitutionNews} = require("../dataBase");
module.exports = {
    createNews: (news = {}) => {
        return InstitutionNews.create(news);
    },
    getWithPagination: async (model, query = {}, _end, _order, _start, _sort, title_like = "", category = "", city_like = "", date_event_lte = null, date_event_gte = null, isPublished, institution = '', cutId = '') => {

        const filterQuery = _getFilterQuery({
            title_like,
            category,
            city_like,
            date_event_gte,
            date_event_lte,
            institution,
            cutId
        }, isPublished);

        let count;

        if (isPublished) {
            count = await model.countDocuments({...filterQuery, status: isPublished});
        } else {
            count = await model.countDocuments({...filterQuery});
        }

        if (!_sort || !_order) {
            _sort = "createdAt"
            _order = -1
        }
        const newSort = _sort?.split('_')[0];

        const items = await model
            .find(filterQuery)
            .limit(_end - _start)
            .skip(_start)
            .sort({[newSort]: _order})
            .collation({locale: 'en', strength: 2})
            .exec();

        return {
            count,
            items
        }
    },
    getInstitutionNews: (status, institutionId) => {
        return InstitutionNews
            .find({institutionId: institutionId, status: status})
            .limit(20)
            .sort({['publishAt.datePublish']: -1});
    },

    getOneNews: (params = {}) => {
        return InstitutionNews.findOne(params)
    },
    findByParams: (params = {}) => {
        return InstitutionNews.find(params);
    }
};

//Перевірка на введені пошукові поля
function _getFilterQuery(otherFilter, isPublished) {
    const searchObject = {};
    const filterConditions = [];

    if (otherFilter.title_like && otherFilter.title_like.length > 0) {
        filterConditions.push({
            $or: [
                {description: {$regex: otherFilter.title_like, $options: "i"}},
                {title: {$regex: otherFilter.title_like, $options: "i"}},
            ],
        });
    }

    if (otherFilter.category) {
        filterConditions.push({
            $or: [{category: {$regex: otherFilter.category, $options: "i"}}],
        });
    }

    if (otherFilter.institution) {
        filterConditions.push({
            institutionId: otherFilter.institution
        })
    }

    if (otherFilter.cutId) {
        filterConditions.push({
            _id: {$ne: otherFilter.cutId}
        })
    }

    if (otherFilter.city_like) {
        filterConditions.push({
            $or: [{"place.city": {$regex: otherFilter.city_like, $options: "i"}}],
        });
    }

    if (otherFilter.date_event_gte && otherFilter.date_event_gte !== "[object Object]" && otherFilter.date_event_lte && otherFilter.date_event_lte !== "[object Object]") {
        const dateGte = new Date(otherFilter.date_event_gte).toISOString();
        const dateLte = new Date(otherFilter.date_event_lte).toISOString();
        filterConditions.push({
            $or: [
                {dateEvent: {$elemMatch: {"schedule.from": {$gte: dateGte, $lte: dateLte}}}},
                {dateEvent: {$elemMatch: {"schedule.to": {$lte: dateLte, $gte: dateGte}}}}
            ]
        })
    } else if (otherFilter.date_event_gte && otherFilter.date_event_gte !== "[object Object]" && (!otherFilter.date_event_lte || otherFilter.date_event_lte === "[object Object]")) {
        const dateGte = new Date(otherFilter.date_event_gte);
        dateGte.setDate(dateGte.getDate() + 1);
        const isoDateGte = dateGte.toISOString();
        filterConditions.push({
            $or: [
                {dateEvent: {$elemMatch: {"schedule.from": {$gte: isoDateGte}}}}
            ]
        })
    } else if (otherFilter.date_event_lte && otherFilter.date_event_lte !== "[object Object]" && (!otherFilter.date_event_gte || otherFilter.date_event_gte === "[object Object]")) {
        const dateLte = new Date(otherFilter.date_event_lte);
        dateLte.setDate(dateLte.getDate() + 1);
        const isoDateLte = dateLte.toISOString();
        filterConditions.push({
            $or: [
                {dateEvent: {$elemMatch: {"schedule.to": {$lte: isoDateLte}}}}
            ]
        })
    }

    if (filterConditions.length > 0) {
        Object.assign(searchObject, {$and: filterConditions});
    }

    if (isPublished) {
        Object.assign(searchObject, {status: isPublished});
    }
    return searchObject;
}
