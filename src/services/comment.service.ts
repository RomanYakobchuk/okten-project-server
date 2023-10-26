import {CommentItemSchema} from "../dataBase";
import {IComment, ICreateCommentItem, IInstitution} from "../interfaces/common";
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

    getWithPagination(_end: number, _order: any, _start: number, _sort: any, text_like: string, user: string, institution: string, day_gte: any): Promise<{
        count: number,
        items: IComment[]
    }>

    getEstablishmentTopLevelComments(id: string, _end: number, _start: number, _sort: any, _order: any): Promise<{
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
            const parent = await CommentItemSchema.findOne({_id: newComment?.parentId, establishmentId: newComment?.establishmentId});
            if (parent) {
                parent.repliesLength += 1;
                await parent?.save();
                parentReviewsLength = parent.repliesLength;
            }
        }
        const populate: TPopulate = [{path: 'createdBy', select: newComment?.refFieldCreate === 'user' ? '_id name avatar' : '_id title pictures'}];

        let dataWithCreatedBy = await newComment.populate(populate);

        if (newComment?.refFieldCreate === 'institution') {
            const creatorEstablishment = dataWithCreatedBy?.createdBy as IInstitution;
            if (creatorEstablishment?.pictures?.length > 0 && creatorEstablishment?.title) {
                dataWithCreatedBy = {
                    createdBy: {
                        _id: creatorEstablishment?._id,
                        name: creatorEstablishment?.title,
                        avatar: creatorEstablishment?.pictures[0]?.url || ''
                    },
                    parentId: dataWithCreatedBy?.parentId,
                    establishmentId: dataWithCreatedBy?.establishmentId,
                    createdAt: dataWithCreatedBy?.createdAt,
                    _id: dataWithCreatedBy?._id,
                    refFieldCreate: dataWithCreatedBy?.refFieldCreate,
                    text: dataWithCreatedBy?.text,
                } as IComment;
            }
        } else {
            const p = {...{...newComment?._doc}} ?? {};
            dataWithCreatedBy = {
                ...p,
            } as IComment;
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

    async getWithPagination(_end: number, _order: any, _start: number, _sort: any, text_like: string = "", user = '', institution = '', day_gte: any = null) {
        const filterQuery = _getFilterQuery({text_like, day_gte, user, institution});

        const count = await CommentItemSchema.countDocuments({...filterQuery});

        if (!_sort || !_order) {
            _sort = 'createdAt'
            _order = -1
        }

        _sort = _sort?.split('_')[0];

        const items = await CommentItemSchema
            .find(filterQuery)
            .populate([{path: 'institutionId', select: '_id title type place'}, {
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

    async getEstablishmentTopLevelComments(id: string, _end: number, _start: number, _sort: any, _order: any, parentId: string | null = null) {
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

        const count = await CommentItemSchema.countDocuments({establishmentId: id, parentId: parentId});

        const skip = _start;
        const limit = _end - _start;

        const aggregationPipeline: AggregationPipeline[] = [];
        aggregationPipeline.push(
            {
                $match: {establishmentId: id, parentId: parentId ? new Types.ObjectId(parentId) : parentId}
            },
            // {
            //     $skip: _start
            // },
            // {
            //     $limit: _end - _start
            // },
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
                    from: "institutions",
                    localField: 'createdBy',
                    foreignField: '_id',
                    as: 'createdByInstitutions'
                }
            },
            {
                $addFields: {
                    createdByInstitutions: {
                        $arrayElemAt: ['$createdByInstitutions', 0]
                    }
                }
            },
            // {
            //     $lookup: {
            //         from: 'commentitems',
            //         localField: '_id',
            //         foreignField: 'answerTo',
            //         as: 'answerCommentTo'
            //     }
            // },
            // {
            //     $addFields: {
            //         commentAnswerTo: {
            //             $arrayElemAt: ['$answerCommentTo', 0],
            //         }
            //     }
            // },
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
                    from: 'institutions',
                    localField: '_id',
                    foreignField: 'commentAnswerTo.createdBy',
                    as: 'answerToCreatedByInstitutions'
                }
            },
            // {
            //     $addFields: {
            //         answerToCreatedByInstitution: {$arrayElemAt: ['$answerToCreatedByInstitutions', 0]},
            //         answerToCreatedByUser: {$arrayElemAt: ['$answerToCreatedByUsers', 0]}
            //     }
            // },
            {
                $group: {
                    _id: null,
                    totalTopLevelComments: {$sum: 1},
                    topLevelComments: {$push: '$$ROOT'}
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
                                                            _id: '$$comment.createdByInstitutions._id',
                                                            name: '$$comment.createdByInstitutions.title',
                                                            avatar: {
                                                                $ifNull: [
                                                                    {$arrayElemAt: ['$$comment.createdByInstitutions.pictures.url', 0]},
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
            {
                $sort: {
                    [newSort]:
                    _order
                }
            }
        )

        const result = await CommentItemSchema.aggregate(aggregationPipeline).exec();

        const [aggregationResult] = result;

        return {
            items: aggregationResult?.topLevelComments ?? [],
            count,
            currentSize: aggregationResult?.totalTopLevelComments ?? 0
        }
    }
}

function

_getFilterQuery(otherFilter: any) {
    const searchObject = {};
    const filterConditions: any[] = [];

    if (otherFilter.text_like && otherFilter.text_like.length > 0) {
        filterConditions.push({
            text: {$regex: otherFilter.text_like, $options: 'i'}
        })
    }
    if (otherFilter.institution) {
        filterConditions.push({
            institutionId: otherFilter.institution
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
        Object.assign(searchObject, {$and: [...filterConditions, {parentId: null}]});
    }

    return searchObject;
}

export {
    CommentService
}