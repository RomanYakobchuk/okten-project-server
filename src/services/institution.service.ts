import {InstitutionSchema} from "../dataBase";
import {IInstitution} from "../interfaces/common";


class InstitutionService {
    async getWithPagination(
        _end: number,
        _order: any,
        _start: number,
        _sort: any,
        title_like = "",
        type = "",
        isVerify: string,
        averageCheck_gte: any = 0,
        averageCheck_lte: any = 100000,
        city_like: string,
        userStatus: string
    ) {
        const filterQuery = _getFilterQuery({
            title_like,
            type,
            averageCheck_gte,
            averageCheck_lte,
            city_like
        }, isVerify);

        let count: number;
        if (isVerify) {
            count = await InstitutionSchema.countDocuments(
                {...filterQuery, verify: isVerify}
            );
        } else {
            count = await InstitutionSchema.countDocuments({...filterQuery});
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

        let items: IInstitution[];
        if (userStatus === 'admin') {
            items = await InstitutionSchema
                .find(filterQuery)
                .select('pictures reviewsLength _id rating type place title createdBy description averageCheck')
                .populate({path: 'views', select: 'viewsNumber'})
                .limit(_end - _start)
                .skip(_start)
                .sort({[newSort]: _order})
                .exec();
        } else {
            items = await InstitutionSchema
                .find(filterQuery)
                .select('pictures reviewsLength _id rating type place title createdBy description averageCheck')
                .limit(_end - _start)
                .skip(_start)
                .sort({[newSort]: _order})
                .exec();
        }

        return {
            count,
            items
        }
    }

    createInstitution(institution: any) {
        return InstitutionSchema.create(institution);
    }

    getOneInstitution(params: { _id: string }) {
        return InstitutionSchema.findOne(params)
    }

    async getAllByUserParams(_end: number, _start: number, _sort: any, _order: any, userId: string, verify: string) {
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

        const count = await InstitutionSchema.countDocuments({createdBy: userId, verify: verify});

        const items = await InstitutionSchema
            .find({createdBy: userId, verify: verify})
            .select('_id pictures title place averageCheck type rating description createdBy createdAt')
            .limit(_end - _start)
            .skip(_start)
            .sort({[newSort]: _order});

        return {
            items,
            count
        }
    }

    deleteOne(params: any) {
        return InstitutionSchema.deleteOne(params)
    }

    async getUserInstitutionsByQuery(search_like = '', createdBy: string) {
        const searchObject = {};

        if (createdBy === 'all') {
            Object
                .assign(searchObject, {
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
        const institutions = await InstitutionSchema
            .find(searchObject)
            .select('_id title pictures place')
            .limit(20)
            .sort({['title']: 'asc'})
            .exec();

        return {
            items: institutions
        }
    }

    async getSimilar(establishment: IInstitution) {
        const minCheck = establishment.averageCheck * 0.8;
        const maxCheck = establishment.averageCheck * 1.2;

        const items = await InstitutionSchema
            .find({
                "place.city": establishment.place.city,
                type: establishment.type,
                averageCheck: {$gte: minCheck, $lte: maxCheck},
                verify: "published",
                _id: {$ne: establishment._id}
            })
            .limit(5)
            .exec();

        return {
            items
        }
    }

    async getNearby(location: { lat: number, lng: number }, maxDistance: number) {

        const count = await InstitutionSchema.countDocuments({
            location: {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: [location.lng, location.lat],
                    },
                    $maxDistance: maxDistance
                }
            },
            verify: "published"
        });

        const items = await InstitutionSchema
            .find({
                location: {
                    $near: {
                        $geometry: {
                            type: "Point",
                            coordinates: [location.lng, location.lat],
                        },
                        $maxDistance: maxDistance
                    }
                },
                verify: "published"
            }).exec();

        return {
            items, count
        }
    }
}

//Перевірка на введені пошукові поля

function _getFilterQuery(otherFilter: any, isVerify: string) {

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
    InstitutionService
}