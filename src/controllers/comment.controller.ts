import {NextFunction, Response} from "express";

import {CustomRequest} from "../interfaces/func";
import {CommentService} from "../services";
import {CustomError} from "../errors";
import {IAnswerComment, IComment, IInstitution, IOauth, IUser} from "../interfaces/common";
import {Schema} from "mongoose";

class CommentController {
    private commentService: CommentService;

    constructor() {
        this.commentService = new CommentService();

        this.allComments = this.allComments.bind(this);
        this.createComment = this.createComment.bind(this);
        this.allCommentsByInstitutionUserId = this.allCommentsByInstitutionUserId.bind(this);
        this.allAnsweredCommentById = this.allAnsweredCommentById.bind(this);
        this.allCommentsByUserId = this.allCommentsByUserId.bind(this);
        this.deleteComment = this.deleteComment.bind(this);
    }

    async allComments(req: CustomRequest, res: Response, next: NextFunction) {
        const {
            _end,
            _order,
            _start,
            _sort,
            text_like = "",
            day_gte,
            user = '',
            institution = ''
        } = req.query;

        const userStatus = req.newStatus;

        if (userStatus !== 'admin') {
            return next(new CustomError("Access denied", 403));
        }

        try {

            const {
                count,
                items
            } = await this.commentService.getWithPagination(Number(_end), _order, Number(_start), _sort, text_like as string, user as string, institution as string, day_gte);

            res.header('x-total-count', `${count}`);
            res.header('Access-Control-Expose-Headers', 'x-total-count');

            res.status(200).json(items)
        } catch (e) {
            next(e)
        }
    }
    allCommentsByInstitutionUserId = (type: string) => async (req: CustomRequest, res: Response, next: NextFunction) => {
        const {_order, _sort, _end, _start} = req.query;
        const {userId} = req.user as IOauth;
        const user = userId as IUser;

        try {
            let id: any = '';
            if (type === 'institutionId') {
                const institution = req.data_info as IInstitution;
                id = institution?._id
            } else if (type === 'createdBy') {
                const currentUser = req.userExist;
                id = currentUser?._id;
                if (id?.toString() !== user?._id?.toString() && user?.status !== 'admin') {
                    return next(new CustomError("Access denied", 403))
                }
            }
            const {
                items,
                count
            } = await this.commentService.getAllByPlaceWithPagination(id, Number(_end), Number(_start), _sort, _order, type)

            res.header('x-total-count', `${count}`);
            res.header('Access-Control-Expose-Headers', 'x-total-count');

            res.status(200).json(items);

        } catch (e) {
            next(e)
        }
    }
    async allAnsweredCommentById(req: CustomRequest, res: Response, next: NextFunction) {
        const comment = req.comment as IAnswerComment;
        const {_end, _start} = req.query;

        try {
            const {count, items} = await this.commentService.getAllAnswerComments(comment?._id as string, Number(_end), Number(_start));

            res.header('x-total-count', `${count}`);
            res.header('Access-Control-Expose-Headers', 'x-total-count');

            res.status(200).json(items);
        } catch (e) {
            next(e)
        }
    }
    async allCommentsByUserId(req: CustomRequest, res: Response, next: NextFunction) {
        try {
            const {userId} = req.user as IOauth;
            const {id} = req.params;

            const user = userId as IUser;

            if (id !== user?._id?.toString() && user?.status !== 'admin') {
                return next(new CustomError("Access denied", 403))
            }
            let searchId: string;
            if (user?.status === 'admin') {
                searchId = id
            } else {
                searchId = user?._id
            }

            const comments = await this.commentService.getItemsByParams({createdBy: searchId})
                .populate([{path: 'institutionId', select: 'title pictures type _id', options: {limit: 1}}, {
                    path: 'createdBy',
                    select: 'avatar name _id'
                }])


            res.status(200).json({
                user_comments: comments ?? []
            })
        } catch (e) {
            next(e)
        }
    }
    async createComment(req: CustomRequest, res: Response, next: NextFunction) {
        try {
            const {text, isAnswer, parentId} = req.body;
            const {userId} = req.user as IOauth;
            const institution = req.data_info;
            const user = userId as IUser;

            if (isAnswer && parentId) {
                const comment = await this.commentService.getItemByParams({_id: parentId});
                if (!comment) {
                    return next(new CustomError("Comment not found", 404));
                }
                const answer = await this.commentService.createAnswerComment({
                    text: text,
                    parentCommentId: comment?._id,
                    createdBy: user?._id
                });

                comment.replies.push(answer?._id as Schema.Types.ObjectId);
                await comment.save();
            } else {
                await this.commentService.createCommentItem({
                    text: text,
                    createdBy: user?._id,
                    institutionId: institution?._id as string,
                })
            }

            res.status(200).json({message: "Comment added successfully"})
        } catch (e) {
            next(e)
        }
    }
    async deleteComment(req: CustomRequest, res: Response, next: NextFunction) {
        try {
            const {userId} = req.user as IOauth;
            const {isAnswer} = req.body;
            const comment = req.comment as any;

            const user = userId as IUser;

            if (user?._id?.toString() !== comment?.createdBy?.toString() && user?.status !== "admin") {
                return res.status(403).json({message: 'It is not your comment'})
            }
            if (isAnswer) {
                const parent = await this.commentService.getItemByParams({_id: comment?.parentCommentId as IAnswerComment["parentCommentId"]}) as IComment;
                parent.replies.pull(comment?._id);
                await parent.save();
                await this.commentService.deleteAnswerComment(comment?._id);
            } else {
                await this.commentService.deleteComment(comment?._id);
            }

            res.status(204).json({message: 'Comment deleted success'});

        } catch (e) {
            next(e)
        }
    }
}

export default new CommentController();