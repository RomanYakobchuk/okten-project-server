import {CommentService, EstablishmentService} from "../services";
import {CustomError} from "../errors";
import {CustomRequest} from "../interfaces/func";
import {NextFunction, Response} from "express";
import {IEstablishment, IOauth, IUser} from "../interfaces/common";

class CommentMiddleware {
    private commentService: CommentService;
    private establishmentService: EstablishmentService;

    constructor() {
        this.commentService = new CommentService();
        this.establishmentService = new EstablishmentService();

        this.checkCommentsByestablishment = this.checkCommentsByestablishment.bind(this);
        this.checkCommentById = this.checkCommentById.bind(this);
        this.checkCreatorIsExist = this.checkCreatorIsExist.bind(this);
    }

    async checkCommentsByestablishment(req: CustomRequest, res: Response, next: NextFunction) {
        try {
            const establishment = req.data_info as IEstablishment;

            const comments = await this.commentService.getItemsByParams({establishmentId: establishment?._id}).populate('items');

            if (!comments) {
                return res.status(404).json({message: 'Comments not found'})
            }
            req.comments = comments;
            next()
        } catch (e) {
            next(e)
        }
    }

    async checkCommentById(req: CustomRequest, _: Response, next: NextFunction) {
        try {
            const {id} = req.params;

            const comment = await this.commentService.getItemByParams({_id: id});

            if (!comment) {
                return next(new CustomError("Comment not found", 404));
            }
            req.comment = comment;
            next()
        } catch (e) {
            next(e)
        }
    }

    async checkCreatorIsExist(req: CustomRequest, _: Response, next: NextFunction) {
        const {refFieldCreate, createdBy} = req.body;
        const {userId} = req.user as IOauth;
        const user = userId as IUser;
        try {
            let IdOfCreatedBy: IUser | IEstablishment;
            if (refFieldCreate !== 'establishment' && refFieldCreate !== 'user' && !createdBy) {
                return next(new CustomError('Invalid refFieldCreate value or createdBy not exist', 400))
            }
            if (refFieldCreate === 'establishment') {
                IdOfCreatedBy = await this.establishmentService.getOneEstablishment({_id: createdBy}) as IEstablishment;
            } else if (refFieldCreate === 'user') {
                IdOfCreatedBy = user;
            } else {
                return next(new CustomError('Something went wrong', 404))
            }

            if (!IdOfCreatedBy) {
                return next(new CustomError('CreatedBy not found', 404));
            }
            req.body.createdBy = IdOfCreatedBy?._id;
            next()
        } catch (e) {
            next(e);
        }
    }
}

export default new CommentMiddleware();