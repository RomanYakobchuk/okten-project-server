import {Institution} from "../dataBase";
import {IInstitution} from "../interfaces/common";
import {IInstitutionModel} from "../dataBase/institution";


class InstitutionService {
    async getWithPagination(
        model: any,
        _end: number,
        _order: any,
        _start: number,
        _sort: any,
        title_like = "",
        type = "",
        tags = "",
        isVerify: string,
        averageCheck_gte = 0,
        averageCheck_lte = 100000,
        city_like: string,
        userStatus: string
    ) {
        const filterQuery = _getFilterQuery({
            title_like,
            type,
            tags,
            averageCheck_gte,
            averageCheck_lte,
            city_like
        }, isVerify);

        let count: number;
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

        let items: any[];
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
    }

    createInstitution(institution: any) {
        return Institution.create(institution);
    }

    getOneInstitution(params: { _id: string }) {
        return Institution.findOne(params)
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
    }

    deleteOne(params: any) {
        return Institution.deleteOne(params)
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

    async getSimilar(establishment: IInstitution) {
        const minCheck = establishment.averageCheck * 0.8;
        const maxCheck = establishment.averageCheck * 1.2;

        const items = await Institution
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

        const count = await Institution.countDocuments({
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

        const items = await Institution
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


export {
    InstitutionService
}