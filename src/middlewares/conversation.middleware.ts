import {NextFunction, Response} from "express";

import {ConversationService} from "../services";
import {CustomError} from "../errors";
import {CustomRequest} from "../interfaces/func";
import {IConversation, IConvMembers, IOauth, IUser} from "../interfaces/common";
import {checkNewChatByMembers} from "../controllers/conversation.controller"
import {dependPopulate, reformatChat} from "../services/conversation.service";

class ConversationMiddleware {
    private conversationService: ConversationService;

    constructor() {
        this.conversationService = new ConversationService();

        this.checkConversation = this.checkConversation.bind(this);
    }

    conversationOneByOneExist = () => async (req: CustomRequest, _: Response, next: NextFunction) => {
        const {members, type} = req.body;
        try {
            const byType = await checkNewChatByMembers({members: members, type: type});
            if (!byType.isAccess) {
                return next(new CustomError(byType.message, 400));
            }
            const ids = members?.map((member: IConvMembers) => member?.user);
            if (type === 'private' && members?.length === 2) {
                const exist = await this.conversationService.getOne({
                    members: {
                        $all: [
                            {$elemMatch: {user: ids[0]}},
                            {$elemMatch: {user: ids[1]}},
                        ],
                        $size: 2
                    },
                    "type": "private"
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
    checkConversation = async (req: CustomRequest, res: Response, next: NextFunction) => {
        const {userId} = req.user as IOauth;
        const user = userId as IUser;
        const {id} = req.params;
        const status = req.newStatus;

        try {

            const conversation = await this.conversationService
                .getOne({_id: id})
                .populate([
                    {path: 'members.user', select: '_id name avatar uniqueIndicator'},
                    ...dependPopulate,
                    {
                        path: 'members.showInfoAs.id',
                        // match: {'showInfoAs.item': "establishment"},
                        select: '_id title pictures',
                    }
                ])
                .exec();

            if (!conversation) {
                return next(new CustomError("Conversation not found", 404));
            }

            user.status = status;
            const formattedChat = reformatChat(conversation?.toObject() as IConversation, user);
            const isExist = formattedChat?.members?.some((member, index) => {
                return member?.userId?.toString() === user._id?.toString()
            })
            if (!isExist && status !== 'admin') {
                const isUserCanJoin = !isExist && formattedChat.access === 'public';
                res.status(403).json({
                    message: 'Access denied',
                    isUserCanJoin,
                })
                return;
            }

            req.conversation = formattedChat;
            next();
        } catch (e) {
            next(e)
        }
    }
}

export default new ConversationMiddleware();