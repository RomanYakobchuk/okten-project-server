import {NextFunction, Response} from "express";

import {ConversationService, InstitutionService} from "../services";
import {CustomError} from "../errors";
import {CustomRequest} from "../interfaces/func";
import {IConversation, IOauth, IUser} from "../interfaces/common";

class ConversationMiddleware {
    private conversationService: ConversationService;
    private institutionService: InstitutionService;

    constructor() {
        this.conversationService = new ConversationService();
        this.institutionService = new InstitutionService();

        this.checkConversation = this.checkConversation.bind(this);
    }

    checkConversation = (type: string) => async (req: CustomRequest, res: Response, next: NextFunction) => {

        const {userId} = req.user as IOauth;
        const user = userId as IUser;
        const {id} = req.params;
        const status = req.newStatus;

        try {
            let conversation = {} as IConversation;
            if (type === 'allInfo') {
                conversation = await this.conversationService
                    .getOne({_id: id})
                    .populate([
                        {path: 'members.user', select: '_id name avatar'},
                        {path: 'institutionId', select: '_id title pictures'},
                    ]) as IConversation
            } else if (type === 'someInfo') {
                conversation = await this.conversationService.getOne({_id: id}) as IConversation;
            }
            const isExist = conversation.members.some((member) => member.user.toString() === user._id.toString())
            if (!isExist && status !== 'admin') {
                return next(new CustomError('Access denied', 403))
            }

            if (!conversation) {
                return next(new CustomError("Conversation not found", 404));
            } else {
                req.conversation = conversation;
                next();
            }
        } catch (e) {
            next(e)
        }
    }
}

export default new ConversationMiddleware();