import {NextFunction, Response} from "express";

import {CustomRequest} from "../interfaces/func";
import {CloudService, ConversationService, MessageService} from "../services";
import {
    IConversation,
    IConvMembers,
    IOauth,
    IUser
} from "../interfaces/common";
import {CustomError} from "../errors";
import {dependPopulate, reformatChat} from "../services/conversation.service";

class ConversationController {
    private conversationService: ConversationService;
    private cloudService: CloudService;
    private messageService: MessageService;

    constructor() {
        this.conversationService = new ConversationService();
        this.cloudService = new CloudService();
        this.messageService = new MessageService();

        this.createConv = this.createConv.bind(this);
        this.getConvByUserId = this.getConvByUserId.bind(this);
        this.getConvTwoUserId = this.getConvTwoUserId.bind(this);
        this.updateTitleName = this.updateTitleName.bind(this);
        this.getConvById = this.getConvById.bind(this);
        this.createOwnChat = this.createOwnChat.bind(this);
        this.deleteChat = this.deleteChat.bind(this);
    }

    async createOwnChat(req: CustomRequest, res: Response, next: NextFunction) {
        const {userId} = req.user as IOauth;
        const user = userId as IUser;
        const {chatName, members, type, access, dependItem, dependId, picture} = req.body;
        const pictureFile = req.files?.picture;
        try {

            const chat = await this.conversationService.createConv({
                members: members,
                access: access,
                admin: user?._id as string,
                type: type,
                chatName: chatName,
                picture: picture || '',
                depend: {
                    item: dependItem,
                    id: dependId as string
                },
            });
            if (req.files?.picture) {
                const {url} = await this.cloudService.uploadFile(pictureFile, `chats/${chat?._id}/picture`);
                chat.picture = url;
                await chat.save();
            }
            const populated = await chat.populate([
                ...dependPopulate,
                {path: 'members.user', select: '_id avatar name uniqueIndicator'},
                {
                    path: 'members.showInfoAs.id',
                    select: '_id title pictures'
                }
            ]);
            const newInfo = reformatChat(populated?.toObject(), user);

            res.status(200).json({chat: newInfo, message: 'Chat created successfully'});
        } catch (e) {
            next(e);
        }
    }

    createConv = () => async (req: CustomRequest, res: Response, next: NextFunction) => {
        const user = req.userExist as IUser;
        const {userId} = req.user as IOauth;
        const currentUser = userId as IUser;
        const {type, dependItem, dependId, members} = req.body;

        try {
            const byType = await checkNewChatByMembers({members: members, type: type});

            if (!byType.isAccess) {
                return next(new CustomError(byType.message, 400));
            }
            const filters = {
                members: {$elemMatch: {user: currentUser?._id}},
                'type': type,
                'depend.item': dependItem,
                'depend.id': dependId
            }
            const conv = await this.conversationService.getOne(filters)
                .populate([
                    ...dependPopulate,
                    {path: 'members.user', select: '_id avatar name uniqueIndicator'},
                    {
                        path: 'members.showInfoAs.id',
                        select: '_id title pictures'
                    }
                ]);

            if (conv) {
                const chat = conv?.toObject();
                const formattedChat = reformatChat(chat, user);
                return res.status(200).json({message: 'Conversation is exist', chat: formattedChat});
            } else {

                await this.createOwnChat(req, res, next);
                return;
            }
        } catch (e) {
            next(e)
        }
    }

    async getConvByUserId(req: CustomRequest, res: Response, next: NextFunction) {
        const {_end, _start, _sort, _order, title_like, establishmentId, dependItem} = req.query;
        const user = req.userExist as IUser;
        const status = req.newStatus;

        try {
            const {
                items,
                count
            } = await this.conversationService.getAllByUser(
                Number(_end),
                Number(_start),
                _sort,
                _order,
                status,
                title_like as string,
                user?._id as string,
                establishmentId as string,
                user,
                dependItem as string
            );


            res.header('x-total-count', `${count}`);
            res.header('Access-Control-Expose-Headers', 'x-total-count');

            res.status(200).json(items);
        } catch (e) {
            next(e)
        }
    }

    async getConvTwoUserId(req: CustomRequest, res: Response, next: NextFunction) {
        try {
            const {userId, establishmentId} = req.body;

            const conv = await this.conversationService
                .getOne({members: {$elemMatch: {user: userId}}, establishmentId: establishmentId})
                .populate([
                    {path: 'members.user', select: '_id avatar name uniqueIndicator'},
                    {path: 'chatInfo.field.id'}
                ]);

            res.status(200).json(conv);
        } catch (e) {
            next(e)
        }
    }

    async updateTitleName(req: CustomRequest, res: Response, next: NextFunction) {
        const conversation = req.conversation as IConversation;
        const {newName, newTitle} = req.body;
        const status = req.newStatus;
        try {
            // if (status === 'admin' || status === 'manager') {
            //     conversation.userName = newName
            // }
            // if (status === 'admin' || status === 'user') {
            //     conversation.establishmentTitle = newTitle
            // }
            await conversation.save();

            res.status(200).json({message: 'Value updated successfully'});
        } catch (e) {
            next(e)
        }
    }

    async getConvById(req: CustomRequest, res: Response, next: NextFunction) {
        const conversation = req.conversation as IConversation;
        try {
            res.status(200).json(conversation)
        } catch (e) {
            next(e)
        }
    }

    async deleteChat(req: CustomRequest, res: Response, next: NextFunction) {
        const {userId} = req.user as IOauth;
        const user = userId as IUser;
        const conversation = req.conversation as IConversation;
        try {
            const isUserInChat = conversation?.members?.find((member) => member?.user?.toString() === user?._id?.toString());

            if (isUserInChat) {
                const deleteChatOneByOne = async () => {
                    await this.messageService.deleteAllByParams({conversationId: conversation?._id});
                    // потрібно додати видалення файлів
                    await this.conversationService.deleteOne({_id: conversation?._id});
                }
                const deleteChatByGroup = async () => {
                    if (conversation?.members?.length === 1) {
                        await deleteChatOneByOne();
                    } else {
                        conversation?.members?.filter((member) => member?.user?.toString() !== user?._id?.toString());
                        await conversation.save();
                    }
                }
                const deleteByType = {
                    oneByOne: await deleteChatOneByOne(),
                    group: deleteChatByGroup()
                }
                await deleteByType[conversation?.type];

                return res.status(200);
            } else {
                return res.status(200);
            }
        } catch (e) {
            next(e)
        }
    }
}

export default new ConversationController();

export const checkNewChatByMembers = async ({members, type}: {
    members: IConvMembers[],
    type: IConversation['type']
}) => {
    let message = 'Access';
    const byType = {
        group: {
            value: members?.length > 0,
            message: members?.length > 0 ? 'Access' : 'Numbers of Users are wrong'
        },
        private: {
            value: members?.length === 2,
            message: members?.length === 2 ? 'Access' : 'You need to find user'
        }
    }
    const isUnique = members.every((member, index, array) =>
        array.findIndex((item) => item.user === member.user) === index
    )
    if (!isUnique) {
        message = 'Users aren`t unique'
    }

    if (!byType[type]?.value) {
        message = byType[type]?.message
    }

    return {
        isAccess: byType[type]?.value && isUnique,
        message: message
    };
}