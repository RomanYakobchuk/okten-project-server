import {NextFunction, Response} from "express";

import {ConversationService, InstitutionService} from "../services";
import {CustomError} from "../errors";
import {CustomRequest} from "../interfaces/func";
import {IConversation, IConvMembers, IOauth, IUser} from "../interfaces/common";
import {checkNewChatByMembers, validateChatInfoField} from "../controllers/conversation.controller"

class ConversationMiddleware {
    private conversationService: ConversationService;
    private institutionService: InstitutionService;

    constructor() {
        this.conversationService = new ConversationService();
        this.institutionService = new InstitutionService();

        this.checkConversation = this.checkConversation.bind(this);
    }

    conversationOneByOneExist = () => async (req: CustomRequest, _: Response, next: NextFunction) => {
        const {members, chatType} = req.body;
        try {
            const byType = await checkNewChatByMembers({members: members, type: chatType});
            if (!byType.isAccess) {
                return next(new CustomError(byType.message, 400));
            }
            const ids = members?.map((member: IConvMembers) => member?.user);
             if (chatType === 'oneByOne' && members?.length === 2) {
                const exist = await this.conversationService.getOne({
                    members: {
                        $all: [
                            {$elemMatch: {user: ids[0]}},
                            {$elemMatch: {user: ids[1]}},
                        ],
                        $size: 2
                    },
                    "chatInfo.type": "oneByOne"
                });
                if (exist) {
                    return next(new CustomError('Chat is exist', 409))
                }
             }
             next();
        } catch (e) {
            next(e);
        }
    }
    checkConversation = (type: "allInfo" | "someInfo") => async (req: CustomRequest, res: Response, next: NextFunction) => {

        const {userId} = req.user as IOauth;
        const user = userId as IUser;
        const {id} = req.params;
        const status = req.newStatus;

        try {
            let conversation = {} as IConversation;
            const chatInfo = {
                allInfo: validateChatInfoField({item: await this.conversationService
                        .getOne({_id: id})
                        .populate([
                            {path: 'members.user', select: '_id name avatar uniqueIndicator'},
                            {path: 'chatInfo.field.id'}
                        ]) as IConversation, user: user}),
                someInfo: await this.conversationService.getOne({_id: id}) as IConversation
            };
            conversation = chatInfo[type];

            const isExist = conversation.members.some((member) => {
                const memberUser = member?.user as IUser;
                return memberUser?._id.toString() === user._id.toString()
            })
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