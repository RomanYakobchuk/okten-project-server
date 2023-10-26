import {NextFunction, Response} from "express";

import {CustomRequest} from "../interfaces/func";
import {CommentService, isProfaneText} from "../services";
import {CustomError} from "../errors";
import {IComment, IInstitution, IOauth, IUser} from "../interfaces/common";

class CommentController {
    private commentService: CommentService;

    constructor() {
        this.commentService = new CommentService();

        this.allComments = this.allComments.bind(this);
        this.createComment = this.createComment.bind(this);
        this.allCommentsByEstablishment = this.allCommentsByEstablishment.bind(this);
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

    allCommentsByEstablishment = async (req: CustomRequest, res: Response, next: NextFunction) => {
        const {_order, _sort, _end, _start, parentId} = req.query;
        const institution = req.data_info as IInstitution;

        try {

            const {
                items,
                count,
                currentSize
            } = await this.commentService.getEstablishmentTopLevelComments(institution?._id, Number(_end), Number(_start), _sort, _order, parentId as string | null)

            res.header('x-total-count', `${count}`);
            res.header('Access-Control-Expose-Headers', 'x-total-count');

            res.status(200).json({
                items,
                count,
                currentSize
            });

        } catch (e) {
            next(e)
        }
    }

    async allAnsweredCommentById(req: CustomRequest, res: Response, next: NextFunction) {
        const comment = req.comment as IComment;
        const establishment = req.data_info as IInstitution;
        const {_end, _start} = req.query;

        try {
            const {count, items} = await this.commentService.getAllReviewComments(comment?._id as string, Number(_end), Number(_start), establishment?._id);

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
        const {text, parentId, refFieldCreate, createdBy} = req.body;
        const institution = req.data_info as IInstitution;

        try {

            const isProfane = isProfaneText(text);
            if (isProfane) {
                return next(new CustomError('Your comment includes bad words!!!', 400))
            }
            let parentCommentId: string | null = null;
            if (parentId) {
                const parent = await this.commentService.getItemByParams({_id: parentId, establishmentId: institution?._id});
                if (!parent) {
                    return next(new CustomError("Comment not found", 404));
                }
                parentCommentId = parent?._id as string;
            } else {
                parentCommentId = null;
            }
            const {comment, parentReviewsLength} = await this.commentService.createCommentItem({
                text: text,
                parentId: parentCommentId,
                createdBy: createdBy,
                establishmentId: institution?._id,
                refFieldCreate: refFieldCreate === 'establishment' ? 'institution' : refFieldCreate,
            });



            res.status(200).json({message: "Comment added successfully", comment: comment, parentReviewsLength});
        } catch (e) {
            next(e)
        }
    }

    async deleteComment(req: CustomRequest, res: Response, next: NextFunction) {
        const {createdBy} = req.body;
        const {userId} = req.user as IOauth;
        const user = userId as IUser;
        try {
            const comment = req.comment as IComment;

            if (createdBy?.toString() !== comment?.createdBy?.toString() && user?.status !== "admin") {
                return res.status(403).json({message: 'It is not your comment'})
            }

            if (comment?.parentId) {
                await this.commentService.changeParentRepliesLength(comment?.parentId as string);
            }

            res.status(200).send({message: 'Comment deleted success'});
            await this.commentService.deleteByParent(comment?._id as string);
            await this.commentService.deleteComment(comment?._id as string);


        } catch (e) {
            next(e)
        }
    }
}

export default new CommentController();