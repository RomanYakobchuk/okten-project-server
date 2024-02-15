import {EstablishmentNewsSchema} from "../dataBase";
import {IEstablishmentNews} from "../interfaces/common";

interface Repository {
    createNews(news: {}): Promise<IEstablishmentNews>,

    getWithPagination(_end: number, _order: any, _start: number, _sort: any, title_like: string, category: string, city_like: string, date_event_lte: any, date_event_gte: any, isPublished: string, establishment: string, cutId: string): Promise<{
        count: number,
        items: IEstablishmentNews[]
    }>,

    getNews(status: string, establishmentId: string): Promise<{total: number, items: IEstablishmentNews[]}>,

    getOneNews(params: any): Promise<IEstablishmentNews | null>,

    findByParams(params: any): Promise<IEstablishmentNews[] | null>,

}

class NewsService implements Repository {
    createNews(news = {}) {
        return EstablishmentNewsSchema.create(news);
    }

    async getWithPagination(_end: number, _order: any, _start: number, _sort: any, title_like = "", category = "", city_like = "", date_event_lte: any = null, date_event_gte: any = null, isPublished: string, establishment = '', cutId = '') {

        const filterQuery = _getFilterQuery({
            title_like,
            category,
            city_like,
            date_event_gte,
            date_event_lte,
            establishment,
            cutId
        }, isPublished);

        let count: number;

        if (isPublished) {
            count = await EstablishmentNewsSchema.countDocuments({...filterQuery, status: isPublished});
        } else {
            count = await EstablishmentNewsSchema.countDocuments({...filterQuery});
        }

        if (!_sort || !_order) {
            _sort = "createdAt"
            _order = -1
        }
        const newSort = _sort?.split('_')[0];

        const items = await EstablishmentNewsSchema
            .find(filterQuery)
            .populate([{path: 'establishmentId', select: '_is pictures title type'}])
            .limit(_end - _start)
            .skip(_start)
            .sort({[newSort]: _order})
            .collation({locale: 'en', strength: 2})
            .exec();

        return {
            count,
            items
        }
    }

    async getNews(status: string, establishmentId: string) {
        const filters = {establishmentId: establishmentId, status: status};
        const total = await EstablishmentNewsSchema.countDocuments(filters);
        const items = await EstablishmentNewsSchema
            .find(filters)
            .limit(20)
            .sort({['publishAt.datePublish']: -1});

        return {
            total,
            items
        }
    }

    getOneNews(params = {}) {
        return EstablishmentNewsSchema.findOne(params)
    }

    findByParams(params = {}) {
        return EstablishmentNewsSchema.find(params);
    }
}

//Перевірка на введені пошукові поля
function _getFilterQuery(otherFilter: any, isPublished: string) {
    const searchObject = {};
    const filterConditions: any[] = [];

    filterConditions.push({
        $or: [
            {description: {$regex: otherFilter.title_like, $options: "i"}},
            {title: {$regex: otherFilter.title_like, $options: "i"}},
        ],
    });


    if (otherFilter.category) {
        filterConditions.push({
            $or: [{category: {$regex: otherFilter.category, $options: "i"}}],
        });
    }

    if (otherFilter.establishment) {
        filterConditions.push({
            establishmentId: otherFilter.establishment
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


export {
    NewsService
}