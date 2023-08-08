import {CommentService} from "../services";
import {CustomError} from "../errors";
import {CustomRequest} from "../interfaces/func";
import {NextFunction, Response} from "express";
import {IAnswerComment, IComment} from "../interfaces/common";

class CommentMiddleware {
    private commentService: CommentService;

    constructor() {
        this.commentService = new CommentService();

        this.checkCommentsByInstitution = this.checkCommentsByInstitution.bind(this);
        this.checkCommentById = this.checkCommentById.bind(this);
    }
    async checkCommentsByInstitution(req: CustomRequest, res: Response, next: NextFunction) {
        try {
            const institution = req.data_info;

            const comments = await this.commentService.getItemsByParams({institutionId: institution?._id}).populate('items');

            if (!comments) {
                return res.status(404).json({message: 'Comments not found'})
            }
            req.comments = comments;
            next()
        } catch (e) {
            next(e)
        }
    }
    async checkCommentById(req: CustomRequest, res: Response, next: NextFunction) {
        try {
            const {id} = req.params;
            const {isAnswer} = req.body;

            let comment: IAnswerComment | IComment;
            if (isAnswer) {
                comment = await this.commentService.getItemAnswerByParams({_id: id}) as IAnswerComment;
            } else {
                comment = await this.commentService.getItemByParams({_id: id}) as IComment;
            }
            if (!comment) {
                return next(new CustomError("Comment not found", 404));
            }
            req.comment = comment;
            next()
        } catch (e) {
            next(e)
        }
    }
}

export default new CommentMiddleware();