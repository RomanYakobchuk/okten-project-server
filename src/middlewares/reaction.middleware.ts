import {NextFunction, Response} from "express";

import {CustomRequest} from "../interfaces/func";
import {ReactionService} from "../services";
import {CustomError} from "../errors";

class ReactionMiddleware {
    private reactionService: ReactionService;
    constructor() {
        this.reactionService = new ReactionService();

        this.checkReaction = this.checkReaction.bind(this);
    }

    async checkReaction(req: CustomRequest, res: Response, next: NextFunction) {
        const {itemId, fieldName} = req.body;
        try {
            let reaction = await this.reactionService.getOne({
                item: itemId,
                field: fieldName
            });
            if (!reaction) {
                reaction = await this.reactionService.createOne({
                    item: itemId,
                    field: fieldName,
                    likes: [],
                    unLikes: []
                });
                // return next(new CustomError('Reaction not found'));
            }
            req.reaction = reaction;
            next();
        } catch (e) {
            next(e);
        }
    }
}

export default new ReactionMiddleware();