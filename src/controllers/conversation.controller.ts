import {NextFunction, Response} from "express";

import {CustomRequest} from "../interfaces/func";
import {CloudService, ConversationService} from "../services";
import {ICapl, IConversation, IConvMembers, IInstitution, ILastConvMessage, IOauth, IUser} from "../interfaces/common";
import {Schema} from "mongoose";
import {type} from "node:os";
import {CustomError} from "../errors";

class ConversationController {
    private conversationService: ConversationService;
    private cloudService: CloudService;

    constructor() {
        this.conversationService = new ConversationService();
        this.cloudService = new CloudService();

        this.createConv = this.createConv.bind(this);
        this.getConvByUserId = this.getConvByUserId.bind(this);
        this.getConvTwoUserId = this.getConvTwoUserId.bind(this);
        this.updateTitleName = this.updateTitleName.bind(this);
        this.getConvById = this.getConvById.bind(this);
        this.createOwnChat = this.createOwnChat.bind(this);
    }

    async createOwnChat(req: CustomRequest, res: Response, next: NextFunction) {
        const {userId} = req.user as IOauth;
        const user = userId as IUser;
        const {chatName, members, chatType, status} = req.body;
        const picture = req.files?.picture;
        try {

            const chat = await this.conversationService.createConv({
                members: members,
                chatInfo: {
                    status: status,
                    creator: user?._id,
                    type: chatType,
                    chatName: chatName,
                    picture: '',
                    field: {
                        name: 'user',
                        id: user?._id
                    }
                }
            });
            if (req.files?.picture) {
                const {url} = await this.cloudService.uploadFile(picture, `chats/${chat?._id}/picture`);
                chat.chatInfo.picture = url;
                await chat.save();
            }

            res.status(200).json({chat, message: 'Chat created successfully'});
        } catch (e) {
            next(e);
        }
    }

    async createConv(req: CustomRequest, res: Response, next: NextFunction) {
        const user = req.userExist as IUser;
        const institution = req.data_info as IInstitution;
        const {chatName, status} = req.body;
        try {
            const conv = await this.conversationService.getOne({
                userId: user?._id,
                managerId: institution?.createdBy,
                institutionId: institution?._id
            });

            if (conv) {
                res.status(400).json('Conversation is exist');
            } else {
                const currentDate = new Date();
                const members = [
                    {
                        user: user?._id as Schema.Types.ObjectId,
                        connectedAt: currentDate as Date,
                        role: user?.status,
                    },
                    {
                        user: institution?.createdBy as Schema.Types.ObjectId,
                        connectedAt: currentDate as Date,
                        role: 'manager'
                    }
                ]
                const newConv = await this.conversationService.createConv({
                    members: members as IConvMembers[],
                    chatInfo: {
                        status: status,
                        creator: user?._id,
                        field: {
                            name: 'capl',
                            id: institution?._id
                        },
                        chatName,
                        picture: institution?.pictures?.length ? institution?.pictures[0]?.url : '',
                        type: 'oneByOne'
                    },
                    institutionId: institution?._id as Schema.Types.ObjectId,
                    lastMessage: {} as ILastConvMessage,
                });

                res.status(200).json(newConv);
            }
        } catch (e) {
            next(e)
        }
    }

    async getConvByUserId(req: CustomRequest, res: Response, next: NextFunction) {
        const {_end, _start, _sort, _order, title_like, institutionId} = req.query;
        const user = req.userExist as IUser;
        const status = req.newStatus;

        try {

            const {
                items,
                count
            } = await this.conversationService.getAllByUser(Number(_end), Number(_start), _sort, _order, status, title_like as string, user?._id as string, institutionId as string);

            const updated = items?.map((item) => validateChatInfoField({item: item?._doc || item, user: user}));

            res.header('x-total-count', `${count}`);
            res.header('Access-Control-Expose-Headers', 'x-total-count');

            res.status(200).json(updated);
        } catch (e) {
            next(e)
        }
    }

    async getConvTwoUserId(req: CustomRequest, res: Response, next: NextFunction) {
        try {
            const {userId, institutionId} = req.body;

            const conv = await this.conversationService
                .getOne({members: {$elemMatch: {user: userId}}, institutionId})
                .populate([
                    {path: 'members.user', select: '_id avatar name'},
                    {path: 'institutionId', select: '_id title pictures'},
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
            //     conversation.institutionTitle = newTitle
            // }
            await conversation.save();

            res.status(200).json({message: 'Value updated successfully'});
        } catch (e) {
            next(e)
        }
    }

    async getConvById(req: CustomRequest, res: Response, next: NextFunction) {
        const conversation = req.conversation;
        try {
            res.status(200).json(conversation)
        } catch (e) {
            next(e)
        }
    }
}

export default new ConversationController();

const variantInstitution = (item: IInstitution) => {
    return {
        _id: item?._id,
        avatar: item?.pictures?.length && item?.pictures[0]?.url,
        name: item?.title
    }
}
const variantUser = ({currentUser, conversation}: { currentUser: IUser, conversation: IConversation }) => {

    const receiverType = {
        group: {
            _id: conversation?._id,
            avatar: conversation?.chatInfo?.picture,
            name: conversation?.chatInfo?.chatName,
        },
        oneByOne: conversation?.members?.find((member) => {
            const user = member?.user as IUser;
            if (conversation?.members?.length > 1) {
                return user?._id?.toString() !== currentUser?._id?.toString()
            } else {
                return user?._id?.toString() === currentUser?._id?.toString()
            }
        })?.user as IUser
    }
    const item = receiverType[conversation?.chatInfo?.type]
    return {
        _id: item?._id,
        avatar: item?.avatar,
        name: item?.name
    }
}
const variantCapl = (item: ICapl) => {
    return {
        _id: item?._id,
        avatar: '',
        name: item?.fullName + ' ' + item?.eventType
    }
}
export const checkNewChatByMembers = async ({members, type}: {
    members: IConvMembers[],
    type: IConversation['chatInfo']['type']
}) => {
    let message = 'Access';
    const byType = {
        group: {
            value: members?.length > 0,
            message: members?.length > 0 ? 'Access' : 'Numbers of Users are wrong'
        },
        oneByOne: {
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

export const validateChatInfoField = ({user, item}: {item: IConversation, user: IUser}) => {
    const model = item?.chatInfo?.field?.id;
    const variant = {
        institution: variantInstitution(model as IInstitution),
        user: variantUser({currentUser: user, conversation: item}),
        capl: variantCapl(model as ICapl)
    };
    const info = variant[item?.chatInfo?.field?.name];
    const updatedMembers = item?.members?.map((value) => {
        const currentUserInfo = value.user as IUser;
        const nV = value?._doc || value;
        return {
            ...nV,
            indicator: currentUserInfo?.uniqueIndicator?.type === 'private' ? null : currentUserInfo?.uniqueIndicator?.value
        }
    });
    const c = item?._doc || item;
    return {
        ...c,
        members: updatedMembers,
        chatInfo: {
            ...item?.chatInfo,
            field: {
                name: item?.chatInfo?.field?.name,
                id: info?._id
            },
            chatName: info?.name,
            picture: info?.avatar
        }
    } as IConversation;
}