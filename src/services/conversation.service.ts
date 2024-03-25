import {Schema, Document} from "mongoose";

import {IConversation, IUser, IEstablishment, ICapl, TRoles} from "../interfaces/common";
import {ConversationModel} from "../dataBase";

type CreateConv = Omit<IConversation, "_id" | "lastMessage" | keyof Document>;

class ConversationService {
    getOne(params: any) {
        return ConversationModel.findOne(params)
    }

    deleteOne(params = {}) {
        return ConversationModel.deleteOne(params);
    }

    createConv(params: CreateConv) {
        return ConversationModel.create(params);
    }

    updateOne(id: string, params: any) {
        return ConversationModel.updateOne({_id: id}, {...params})
    }

    async getAllByUser(_end: number, _start: number, _sort: any, _order: any, status: TRoles, title_like: string = '', userId: string = '', establishmentId: string = '', user: IUser, dependItem: string) {

        const _filterQuery = getFilters({userId, establishmentId: establishmentId, status, title_like, dependItem});
        if (!_sort || !_order) {
            _sort = 'createdAt'
            _order = -1
        }
        const count = await ConversationModel.countDocuments(_filterQuery).exec();
        const items = await ConversationModel
            .find(_filterQuery)
            .populate(
                [
                    ...dependPopulate,
                    {
                        path: 'admin',
                        select: "_id name avatar status"
                    },
                    {
                        path: 'members.user',
                        select: '_id name avatar'
                    },
                ]
            )
            .populate({
                path: 'members.showInfoAs.id',
                // match: {'members.showInfoAs.item': 'establishment'},
                select: '_id title pictures'
            })
            .sort({[_sort]: _order})
            .limit(_end - _start)
            .skip(_start)
            .exec();

        user.status = status;
        const formattedChats = reformatChats(items, user);

        return {
            items: formattedChats,
            count
        }
    }
}

export const dependPopulate = [{
    path: 'depend.id',
    match: {'depend.item': "user"},
    select: "_id name avatar"
},
    {
        path: 'depend.id',
        match: {'depend.item': "capl"},
        select: "_id establishment",
        populate: {
            path: 'establishment',
            select: "_id title pictures"
        }
    },
    {
        path: 'depend.id',
        match: {'depend.item': "establishment"},
        select: "_id title pictures"
    },];

type ItemChat = Omit<Omit<Document<unknown, {}, IConversation> & IConversation & Required<{
    _id: string | (string & Schema.Types.ObjectId)
}>, never>, never>;
export const reformatChats = (items: ItemChat[], user: IUser) => {
    return items?.map((item) => {
            const chat = item?.toObject() as IConversation;
            return reformatChat(chat, user)
        }
    )
}
export const reformatChat = (chat: IConversation | ItemChat, currentUser: IUser) => {
    const members = chat?.members?.map((member) => {
        const user = member.user as IUser;

        const userByItem = {
            user: () => ({
                user: user,
                userId: user?._id,
                connectedAt: member?.connectedAt,
                showInfoAs: member?.showInfoAs
            }),
            establishment: () => {
                const establishment = member.showInfoAs.id as IEstablishment;
                return {
                    user: {
                        _id: establishment?._id,
                        name: establishment?.title,
                        avatar: establishment?.pictures?.length > 0 ? establishment?.pictures[0]?.url : ''
                    },
                    userId: user?._id,
                    connectedAt: member?.connectedAt,
                    showInfoAs: member?.showInfoAs
                }
            }
        }
        return userByItem[member.showInfoAs.item]();
    });
    if (chat.type === 'private') {
        const receiver = members?.find((member) => member?.userId?.toString() !== currentUser?._id?.toString())?.user as IUser;
        if (currentUser.status !== 'admin') {
            chat.picture = receiver.avatar
            chat.chatName = receiver.name
        }
    }
    return {
        ...chat,
        depend: {
            item: chat?.depend?.item,
            id: dependByItem(chat)[chat?.depend?.item ?? "user"]()
        },
        members: members
    };
}
export const dependByItem = (chat: IConversation) => ({
    user: () => {
        const depend = chat?.depend?.id as IUser;
        return {
            reservation: null,
            _id: depend?._id,
            name: depend?.name,
            avatar: depend?.avatar
        }
    },
    capl: () => {
        const depend = chat?.depend?.id as ICapl;
        const establishment = depend?.establishment as IEstablishment;
        return {
            _id: establishment?._id,
            reservation: depend?._id,
            name: establishment?.title,
            avatar: establishment?.pictures?.length > 0 ? establishment?.pictures[0]?.url : ''
        }
    },
    establishment: () => {
        const depend = chat?.depend?.id as IEstablishment;
        return {
            reservation: null,
            _id: depend?._id,
            name: depend?.title,
            avatar: depend?.pictures?.length > 0 ? depend?.pictures[0]?.url : ''
        }
    }
})

function getFilters(otherFilter: any) {
    const searchObject = {};
    const filters: any[] = [];

    if (otherFilter.userId) {
        filters.push({members: {$elemMatch: {user: otherFilter.userId}}})
    }
    if (otherFilter.dependItem) {
        filters.push({
            "depend.item": otherFilter.dependItem
        })
    }
    // if (otherFilter.establishmentId && otherFilter.type === 'manager') {
    //     filters.push(
    //         {establishmentId: otherFilter.establishmentId},
    //     )
    // }
    // if (otherFilter.title_like) {
    //     filters.push({
    //         $or: [
    //             {establishmentTitle: {$regex: otherFilter.title_like, $options: 'i'}},
    //             {userName: {$regex: otherFilter.title_like, $options: 'i'}},
    //         ]
    //     })
    // }
    //
    // if (otherFilter.title_like) {
    //     filters.push({
    //             $or: [
    //                 {establishmentTitle: {$regex: otherFilter.title_like, $options: 'i'}},
    //                 {userName: {$regex: otherFilter.title_like, $options: 'i'}},]
    //         },
    //     )
    // }

    // if (otherFilter.establishmentId) {
    //     filters.push(
    //         {establishmentId: otherFilter.establishmentId}
    //     )
    // }

    if (filters.length > 0) {
        Object.assign(searchObject, {$and: filters})
    }

    return searchObject;
}

export {
    ConversationService
}