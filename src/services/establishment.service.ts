import {PipelineStage} from "mongoose";

import {EstablishmentSchema} from "../dataBase";
import {IEstablishment, IUser} from "../interfaces/common";
import {_freeSeatsFilterQuery, _getFilterQuery} from "./filters";
import {_getByUserFilter} from "./filters/establishmentFilters.service";

type AggregationPipeline = PipelineStage;

interface NearbyFilter {
    'location.lng': {
        $gte: number;
        $lte: number;
    };
    'location.lat': {
        $gte: number;
        $lte: number;
    };
    verify: string;
    _id?: { $ne: string }; // Опціонально додаємо _id
}

class EstablishmentService {
    async getAverageCheckMinMax(userStatus: IUser['status'] | undefined) {
        const aggregate: AggregationPipeline[] = [];

        if (userStatus !== 'admin') {
            aggregate.push({
                $match: {verify: 'published'}
            })
        }
        aggregate.push(
            {
                $group: {_id: null, minValue: {$min: "$averageCheck"}, maxValue: {$max: "$averageCheck"}}
            },
            {
                $project: {_id: 0, minValue: 1, maxValue: 1}
            }
        )

        return await EstablishmentSchema.aggregate(aggregate).exec();
    }
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
        userStatus: string,
        numberOfFreeSeats: number | string | undefined,
        numberOfTable: number | string | undefined,
        typeOfFreeSeats: "free" | "reserved" | string
    ) {
        const filterQuery = _getFilterQuery({
            title_like,
            type,
            averageCheck_gte,
            averageCheck_lte,
            city_like
        }, isVerify);

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

        _sort = _sort?.split('_')[0];

        _order = _order === 'desc' ? -1 : 1;

        const otherFieldsToInclude = {
            pictures: 1,
            reviewsLength: 1,
            _id: 1,
            rating: 1,
            type: 1,
            place: 1,
            title: 1,
            createdBy: 1,
            description: 1,
            averageCheck: 1,
            freeSeats: 1,
            verify: 1,
            workSchedule: 1,
            location: 1
        };
        const adminFieldsToInclude = {
            'viewsContainer': 1,
        };

        const aggregationPipeline: AggregationPipeline[] = [];

        aggregationPipeline.push(
            {
                $match: filterQuery
            },
            {
                $sort: {
                    [_sort]: _order
                }
            },
            {
                $skip: _start
            },
            {
                $limit: _end - _start
            },
        );
        const countFilter: AggregationPipeline[] = [
            {
                $match: filterQuery
            },
        ];
        if (numberOfFreeSeats || typeOfFreeSeats || numberOfTable) {
            const freeSeatsFilter = _freeSeatsFilterQuery({
                numberOfFreeSeats,
                typeOfFreeSeats,
                numberOfTable
            });

            aggregationPipeline.push(
                {
                    $lookup: {
                        from: 'freeSeats',
                        localField: 'freeSeats',
                        foreignField: 'establishmentId',
                        as: 'freeSeats'
                    }
                },
                {
                    $unwind: '$freeSeats',
                },
                {
                    $match: freeSeatsFilter
                },
            )
            countFilter.push(
                {
                    $lookup: {
                        from: 'freeSeats',
                        localField: 'freeSeats',
                        foreignField: 'establishmentId',
                        as: 'freeSeats'
                    }
                },
                {
                    $unwind: '$freeSeats'
                },
                {
                    $match: {
                        'freeSeats.list.status': 'free'
                    }
                }
            )
        }
        if (userStatus === 'admin') {
            aggregationPipeline.push(
                {
                    $lookup: {
                        from: 'views_containers',
                        localField: 'views',
                        foreignField: '_id',
                        as: 'viewsContainer',
                    }
                },
                {
                    $addFields: {
                        viewsContainer: {
                            $arrayElemAt: ['$viewsContainer', 0]
                        }
                    }
                },
                {
                    $project: {
                        ...adminFieldsToInclude,
                        ...otherFieldsToInclude,
                    }
                }
            );
        } else {
            aggregationPipeline.push({
                $project: otherFieldsToInclude
            })
        }

        if (isVerify) {
            countFilter.push({
                $match: {...filterQuery, verify: isVerify}
            })
        }

        // const filters = _getFilterQuery({title_like, type, averageCheck_gte, averageCheck_lte, city_like}, isVerify)
        const items = await EstablishmentSchema.aggregate(aggregationPipeline).exec();
        // const items = await EstablishmentSchema
        //     .find(filters)
        //     .select('_id pictures title place averageCheck type rating description createdBy createdAt workSchedule')
        //     .limit(_end - _start)
        //     .skip(_start)
        //     .sort({[_sort]: _order})
        //     .exec();
        const countArray = await EstablishmentSchema.aggregate(countFilter).count('count').exec();
        const count = countArray?.length > 0 ? countArray[0]?.count : 0
        return {
            count,
            items
        }
    }

    createEstablishment(establishment: any) {
        return EstablishmentSchema.create(establishment);
    }

    getOneEstablishment(params: { _id: string }) {
        return EstablishmentSchema.findOne(params)
    }

    async getAllByUserParams(_end: number, _start: number, _sort: any, _order: any, userId: string, verify: string, title_like: string = '') {
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

        const filters = _getByUserFilter(verify, title_like, userId);

        const count = await EstablishmentSchema.countDocuments(filters);

        const items = await EstablishmentSchema
            .find(filters)
            .select('_id pictures title place averageCheck type rating description createdBy createdAt workSchedule')
            .limit(_end - _start)
            .skip(_start)
            .sort({[newSort]: _order})
            .exec();

        return {
            items,
            count
        }
    }

    deleteOne(params: any) {
        return EstablishmentSchema.deleteOne(params)
    }

    async getUserEstablishmentsByQuery(search_like = '', createdBy: string, _end: number, _start: number) {
        const searchObject = {};
        if (!_start) {
            _start = 0
        }
        if (!_end) {
            _end = 5
        }
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
        const establishments = await EstablishmentSchema
            .find(searchObject)
            .select('_id title pictures place type location createdBy workSchedule')
            .limit(_end - _start)
            .skip(_start)
            .sort({['title']: 'asc'})
            .exec();

        return {
            items: establishments
        }
    }

    async getSimilar(establishment: IEstablishment) {
        const minCheck = establishment.averageCheck * 0.8;
        const maxCheck = establishment.averageCheck * 1.2;

        const items = await EstablishmentSchema
            .find({
                $and: [
                    {
                        $or: [
                            {"place.city": establishment.place.city},
                            {type: establishment.type},
                            {averageCheck: {$gte: minCheck, $lte: maxCheck}},
                            {verify: "published"},
                        ]
                    },
                    {_id: {$ne: establishment._id}}
                ]
            })
            .select('_id title type pictures createdBy reviewsLength rating place averageCheck workSchedule')
            .limit(5)
            .exec();

        return {
            items
        }
    }

    async getNearby(location: { lat: number, lng: number }, maxDistance: number, _end: number, _start: number, establishmentId: string = '') {

        const degreesLat = maxDistance / 111.32 / 1000;
        const degreesLng = (maxDistance / (111.32 * Math.cos((Math.PI / 180) * location.lat))) / 1000;

        const filter: NearbyFilter = {
            'location.lng': {
                $gte: location.lng - degreesLng,
                $lte: location.lng + degreesLng
            },
            'location.lat': {
                $gte: location.lat - degreesLat,
                $lte: location.lat + degreesLat
            },
            verify: "published"
        };
        if (establishmentId) {
            filter._id = {$ne: establishmentId}
        }
        if (!_start) {
            _start = 0
        }
        if (!_end) {
            _end = 5
        }

        const count = await EstablishmentSchema.countDocuments(filter).exec();

        const items = await EstablishmentSchema
            .find(filter)
            .limit(_end - _start)
            .skip(_start)
            .exec();

        return {
            items, count
        }
    }
}


export {
    EstablishmentService
}