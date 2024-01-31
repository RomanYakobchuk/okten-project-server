import {NextFunction, Response} from "express";

import {CustomRequest} from "../interfaces/func";
import {CloudService, ConversationService, MessageService} from "../services";
import {ICapl, IConversation, IConvMembers, IInstitution, ILastConvMessage, IOauth, IUser} from "../interfaces/common";
import {CustomError} from "../errors";
import {userPresenter} from "../presenters/user.presenter";
import {filterObjectByType} from "../services/other/validateObjectByType";

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

    createConv = () => async (req: CustomRequest, res: Response, next: NextFunction) => {
        const user = req.userExist as IUser;
        const {chatName, status, members, chatType, chatFieldName, chatFieldId} = req.body;
        const picture = req.files?.picture;

        try {
            const filters = {
                members: {$elemMatch: {user: user?._id}},
                'chatInfo.type': chatType,
                'chatInfo.field.name': chatFieldName,
                'chatInfo.field.id': chatFieldId
            }
            const conv = await this.conversationService.getOne(filters)
                .populate([
                    {path: 'chatInfo.field.id'},
                    {path: 'members.user', select: '_id avatar name uniqueIndicator'}
                ]);

            if (conv) {
                const newInfo = validateChatInfoField({user: user, item: conv as IConversation});
                return res.status(200).json({message: 'Conversation is exist', chat: newInfo});
            } else {
                const byType = await checkNewChatByMembers({members: members, type: chatType});
                if (!byType.isAccess) {
                    return next(new CustomError(byType.message, 400));
                }
                const newConv = await this.conversationService.createConv({
                    members: members as IConvMembers[],
                    chatInfo: {
                        status: status,
                        creator: user?._id,
                        field: {
                            name: chatFieldName,
                            id: chatFieldId
                        },
                        chatName,
                        picture: '',
                        type: chatType,
                    },
                    lastMessage: {} as ILastConvMessage,
                });
                if (req.files?.picture) {
                    const {url} = await this.cloudService.uploadFile(picture, `chats/${newConv?._id}/picture`);
                    newConv.chatInfo.picture = url;
                    await newConv.save();
                }
                const populated = await newConv.populate([
                    {path: 'chatInfo.field.id'},
                    {path: 'members.user', select: '_id avatar name uniqueIndicator'}
                ]);
                const newInfo = validateChatInfoField({user: user, item: populated as IConversation});

                return res.status(200).json({message: 'Chat created successfully', chat: newInfo});
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
            //     conversation.institutionTitle = newTitle
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
                await deleteByType[conversation?.chatInfo?.type];

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

const variantInstitution = ({item, members, user}: { item: IInstitution, members: IConvMembers[], user: IUser }) => {
    const currentMember = members?.find((member) => {
        const m = member?.user as IUser;
        return m?._id?.toString() === user?._id?.toString();
    });
    const receiverMember = members?.find((member) => {
        const m = member?.user as IUser;
        return m?._id?.toString() !== user?._id?.toString();
    });
    const receiverMemberUser = receiverMember?.user as IUser;
    const name = currentMember?.conversationTitle || item?.title;
    const image = currentMember?.role === 'user' ? (item?.pictures?.length && item?.pictures[0]?.url) : receiverMemberUser?.avatar;
    return {
        _id: item?._id,
        avatar: image,
        name: name,
        createdBy: item?.createdBy || null
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

export const validateChatInfoField = ({user, item}: { item: IConversation, user: IUser }) => {
    const model = item?.chatInfo?.field?.id;
    const validateByType = {
        institution: model,
        user: (() => {
            type allowedType = Omit<IUser, "password | registerBy | email | dOB | isActivated | phone | phoneVerify | status">;
            const fieldsArray: (keyof IUser)[] = Object.keys({} as allowedType);

            const user = userPresenter(model as IUser);

            return filterObjectByType({
                ...user,
                uniqueIndicator: {
                    type: user?.uniqueIndicator?.type,
                    value: user?.uniqueIndicator?.type === 'public' ? user?.uniqueIndicator?.value : null
                }
            } as IUser, fieldsArray);
        })(),
        capl: model
    }

    const variant = {
        institution: variantInstitution({
            user: user,
            item: model as IInstitution,
            members: item?.members
        }),
        user: variantUser({currentUser: user, conversation: item}),
        capl: variantCapl(model as ICapl)
    };
    const info = variant[item?.chatInfo?.field?.name];
    const updatedMembers = item?.members?.map((value) => {
        const currentUserInfo = value.user as IUser;
        const nV = value?._doc || value;
        return {
            ...nV,
            user: {
                avatar: currentUserInfo?.avatar,
                name: currentUserInfo?.name,
                _id: currentUserInfo?.id
            },
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
                id: validateByType[item?.chatInfo?.field?.name]
            },
            chatName: info?.name,
            picture: info?.avatar
        }
    } as IConversation;
}