import {CommentItemSchema} from "../dataBase";
import {IComment, ICreateCommentItem, IEstablishment} from "../interfaces/common";
import {PipelineStage, Types} from "mongoose";

type AggregationPipeline = PipelineStage;

type TPopulate = Array<{
    path: string;
    select?: string | ((doc: any) => string);
    populate?: {
        path: string;
        select?: string | ((doc: any) => string);
    };
}>;

interface Repository {
    createCommentItem(comment: ICreateCommentItem): Promise<{
        comment: IComment,
        parentReviewsLength: number
    }>,

    getItemsByParams(params: any): Promise<IComment[]>,

    getItemByParams(params: any): Promise<IComment | null>,

    getWithPagination(_end: number, _order: any, _start: number, _sort: any, text_like: string, user: string, establishment: string, day_gte: any): Promise<{
        count: number,
        items: IComment[]
    }>

    getEstablishmentTopLevelComments(id: string, by: "byUser" | "byEstablishment", _end: number, _start: number, _sort: any, _order: any, parentId: string | null, refFieldCreate: string | null): Promise<{
        count: number,
        items: IComment[],
        currentSize: number
    }>
}

class CommentService implements Repository {
    async createCommentItem(comment: ICreateCommentItem) {

        let newComment = await CommentItemSchema.create(comment);
        let parentReviewsLength = 0;
        if (newComment?.parentId) {
            const parent = await CommentItemSchema.findOne({
                _id: newComment?.parentId,
                establishmentId: newComment?.establishmentId
            });
            if (parent) {
                parent.repliesLength += 1;
                await parent?.save();
                parentReviewsLength = parent.repliesLength;
            }
        }

        const populate: TPopulate = [{path: 'createdBy', select: newComment?.refFieldCreate === 'user' ? '_id name avatar' : '_id title pictures'}];

        let dataWithCreatedBy = (await newComment.populate(populate))?.toObject();

        if (newComment?.refFieldCreate === 'establishment') {
            const creatorEstablishment = dataWithCreatedBy?.createdBy as IEstablishment;
            if (creatorEstablishment?.pictures?.length > 0 && creatorEstablishment?.title) {
                dataWithCreatedBy = {
                    ...dataWithCreatedBy,
                    createdBy: {
                        _id: creatorEstablishment?._id,
                        name: creatorEstablishment?.title,
                        avatar: creatorEstablishment?.pictures[0]?.url || ''
                    },
                } as IComment;
            }
        }

        return {
            comment: dataWithCreatedBy,
            parentReviewsLength
        };
    }

    getItemsByParams(params = {}) {
        return CommentItemSchema.find(params)
    }

    async deleteComment(id: string) {
        return CommentItemSchema.deleteOne({_id: id});
    }

    async changeParentRepliesLength(parenId: string) {
        const parent = await CommentItemSchema.findOne({_id: parenId});
        if (parent) {
            parent.repliesLength -= 1;
            await parent?.save();
        }
        return;
    }

    async deleteByParent(parentId: string) {

        const recursiveDelete = async (commentId: string) => {
            const countToDelete = await CommentItemSchema.countDocuments({parentId: commentId});

            let page = 1;
            let pageSize = 100;

            if (countToDelete > 0) {
                while ((page - 1) * pageSize < countToDelete) {
                    const skip = (page - 1) * pageSize;
                    const commentsToDelete = await CommentItemSchema
                        .find({parentId: commentId})
                        .skip(skip)
                        .limit(pageSize)
                        .exec();

                    for (const commentToDelete of commentsToDelete) {
                        await recursiveDelete(commentToDelete?._id as string)
                        await CommentItemSchema.deleteOne({_id: commentToDelete?._id})
                    }
                    page++;
                }
            }
        }

        await recursiveDelete(parentId);
        await CommentItemSchema.deleteMany({parentId});

        return;
    }

    getItemByParams(params = {}) {
        return CommentItemSchema.findOne(params)
    }

    async getAllReviewComments(id: string, _end: number, _start: number, establishmentId: string) {
        const filters = {parentId: id, establishmentId: establishmentId}
        const count = await CommentItemSchema.countDocuments(filters);

        const items = await CommentItemSchema
            .find(filters)
            .populate({
                path: 'createdBy',
                select: '_id name avatar'
            })
            .limit(_end - _start)
            .skip(_start)
            .sort({'createdAt': -1})
            .exec();

        return {
            count,
            items
        }
    }

    async getWithPagination(_end: number, _order: any, _start: number, _sort: any, text_like: string = "", user = '', establishment = '', day_gte: any = null) {
        const filterQuery = _getFilterQuery({text_like, day_gte, user, establishment});

        const count = await CommentItemSchema.countDocuments({...filterQuery});

        if (!_sort || !_order) {
            _sort = 'createdAt'
            _order = -1
        }

        _sort = _sort?.split('_')[0];

        const items = await CommentItemSchema
            .find(filterQuery)
            .populate([{path: 'establishmentId', select: '_id title type place'}, {
                path: 'createdBy',
                select: '_id name email'
            }])
            .limit(_end - _start)
            .skip(_start)
            .sort({[_sort]: _order})
            .exec();

        return {
            items,
            count
        }
    }

    async getEstablishmentTopLevelComments(id: string, by: "byUser" | "byEstablishment", _end: number, _start: number, _sort: any, _order: any, parentId: string | null = null, refFieldCreate: string | null = null) {
        if (!_sort || !_order) {
            _sort = "createdAt"
            _order = -1
        }
        if (!_start) {
            _start = 0
        }
        if (!_end) {
            _end = 20
        }
        const newSort = _sort?.split('_')[0];

        const skip = _start;
        const limit = _end - _start;

        let countFilter = {};

        const aggregationPipeline: AggregationPipeline[] = [];
        if (by === 'byEstablishment') {
            aggregationPipeline.push(
                {
                    $match: {establishmentId: id, parentId: parentId ? new Types.ObjectId(parentId) : parentId}
                },
            )
            countFilter = {establishmentId: id, parentId: parentId};
        } else if (by === 'byUser' && refFieldCreate) {
            aggregationPipeline.push(
                {
                    $match: {
                        createdBy: new Types.ObjectId(id),
                        refFieldCreate: refFieldCreate === 'establishment' ? "establishment" : "user",
                        // parentId: parentId ? new Types.ObjectId(parentId) : parentId
                    }
                },
            );
            countFilter = {
                createdBy: new Types.ObjectId(id),
                refFieldCreate: refFieldCreate === 'establishment' ? "establishment" : "user",
                parentId: parentId ? new Types.ObjectId(parentId) : parentId
            }
        }
        aggregationPipeline.push(
            {
                $sort: {
                    [_sort]: _order
                }
            },
            {
                $lookup: {
                    from: 'commentitems',
                    localField: '_id',
                    foreignField: 'parentId',
                    as: 'replies'
                }
            },
            {
                $addFields: {
                    repliesLength: {
                        $cond: {
                            if: {$isArray: "$replies"},
                            then: {$size: "$replies"},
                            else: 0
                        }
                    }
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: 'createdBy',
                    foreignField: '_id',
                    as: 'createdByUsers'
                }
            },
            {
                $addFields: {
                    createdByUsers: {
                        $arrayElemAt: ['$createdByUsers', 0]
                    }
                }
            },
            {
                $lookup: {
                    from: "establishments",
                    localField: 'createdBy',
                    foreignField: '_id',
                    as: 'createdByEstablishments'
                }
            },
            {
                $addFields: {
                    createdByEstablishments: {
                        $arrayElemAt: ['$createdByEstablishments', 0]
                    }
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: 'commentAnswerTo.createdBy',
                    as: 'answerToCreatedByUsers'
                }
            },
            {
                $lookup: {
                    from: 'establishments',
                    localField: '_id',
                    foreignField: 'commentAnswerTo.createdBy',
                    as: 'answerToCreatedByEstablishments'
                }
            },
            {
                $group: {
                    _id: null,
                    totalTopLevelComments: {$sum: 1},
                    topLevelComments: {$push: '$$ROOT'}
                }
            },
            {
                $sort: {
                    [newSort]:
                    _order
                }
            },
            {
                $project: {
                    totalTopLevelComments: 1,
                    topLevelComments: {
                        $cond: {
                            if: {$ifNull: ['$topLevelComments', null]},
                            then: {
                                $slice: [
                                    {
                                        $map: {
                                            input: '$topLevelComments',
                                            as: 'comment',
                                            in: {
                                                _id: '$$comment._id',
                                                text: '$$comment.text',
                                                createdAt: '$$comment.createdAt',
                                                parentId: '$$comment.parentId',
                                                refFiledCreate: '$$comment.refFieldCreate',
                                                establishmentId: '$$comment.establishmentId',
                                                repliesLength: '$$comment.repliesLength',
                                                createdBy: {
                                                    $cond: {
                                                        if: {$ifNull: ['$$comment.createdByUsers', null]},
                                                        then: {
                                                            _id: '$$comment.createdByUsers._id',
                                                            name: {
                                                                $ifNull: [
                                                                    '$$comment.createdByUsers.name',
                                                                    '$$comment.createdByUsers.title'
                                                                ]
                                                            },
                                                            avatar: {
                                                                $ifNull: [
                                                                    '$$comment.createdByUsers.avatar',
                                                                    {$arrayElemAt: ['$$comment.createdByUsers.pictures.url', 0]}
                                                                ]
                                                            }
                                                        },
                                                        else: {
                                                            _id: '$$comment.createdByEstablishments._id',
                                                            name: '$$comment.createdByEstablishments.title',
                                                            avatar: {
                                                                $ifNull: [
                                                                    {$arrayElemAt: ['$$comment.createdByEstablishments.pictures.url', 0]},
                                                                    null
                                                                ]
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    },
                                    skip,
                                    limit
                                ]
                            },
                            else: []
                        }
                    }
                }
            },
        )
        const count = await CommentItemSchema.countDocuments(countFilter);

        // const result = await CommentItemSchema
        //     .find({$and: filter})
        //     .populate("owner.user owner.establishment")
        //     .select([
        //         {
        //             path: 'owner.user', select: '_id name avatar'
        //         },
        //         {
        //             path: 'owner.establishment', select: '_id title pictures'
        //         }
        //     ])
        //     .limit(limit)
        //     .skip(skip)
        //     .sort({[_sort]: _order})
        //
        //     .exec();
        const result = await CommentItemSchema.aggregate(aggregationPipeline).exec();

        const [aggregationResult] = result;
        // const items = result?.map((item) => {
        //     const v = item?.toObject() as IComment;
        //     if (v?.owner?.establishment && !v?.owner?.user) {
        //         const e = v?.owner?.establishment;
        //         v?.owner = {
        //             ...v?.owner,
        //             user: {
        //                 _id: v?.owner?.establishment?.
        //             }
        //         }
        //     }
        // });

        return {
            items: aggregationResult?.topLevelComments ?? [],
            count,
            currentSize: aggregationResult?.totalTopLevelComments ?? 0
        }
    }
}

function _getFilterQuery(otherFilter: any) {
    const searchObject = {};
    const filterConditions: any[] = [];

    if (otherFilter.text_like && otherFilter.text_like.length > 0) {
        filterConditions.push({
            text: {$regex: otherFilter.text_like, $options: 'i'}
        })
    }
    if (otherFilter.establishment) {
        filterConditions.push({
            sstablishmentId: otherFilter.establishment
        })
    }
    if (otherFilter.user) {
        filterConditions.push({
            createdBy: otherFilter.user
        })
    }
    if (otherFilter.day_gte && otherFilter.day_gte !== "[object Object]") {
        const date = new Date(otherFilter.day_gte);
        const searchDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const nextDay = new Date(searchDay.getTime() + 24 * 60 * 60 * 1000);
        filterConditions.push({
            createdAt: {$gte: searchDay, $lt: nextDay}
        })
    }

    if (filterConditions.length > 0) {
        const filters = [...filterConditions];
        if (!otherFilter.user) {
            filters.push({
                parentId: null
            })
        }
        Object.assign(searchObject, {$and: filters});
    }

    return searchObject;
}

export {
    CommentService
}
// const filter: Array<FilterQuery<IComment>> = [];
// if (by === 'byEstablishment') {
//     filter.push({
//         $match: {establishmentId: id, parentId: parentId ? new Types.ObjectId(parentId) : parentId}
//     })
//     countFilter = {establishmentId: id, parentId: parentId};
// }
// if (by === 'byUser' && refFieldCreate) {
//     filter.push({
//         $or: [
//             {"owner.user": new Types.ObjectId(id)},
//             {"owner.establishment": new Types.ObjectId(id)},
//         ]
//     })
//     countFilter = {
//         $and: [
//             {
//                 $or: [
//                     {"owner.user": new Types.ObjectId(id)},
//                     {"owner.establishment": new Types.ObjectId(id)},
//                 ],
//             },
//             {
//                 parentId: parentId ? new Types.ObjectId(parentId) : parentId
//             }
//         ]
//     }
// }
