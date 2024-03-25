import {Schema, model} from "mongoose";
import {IMessage, IConversation} from "../interfaces/common";
import {IConversationModel, IMessageModel} from "../interfaces/model";

const Conversation = new Schema({
    lastMessage: {
        sender: {
            type: Schema.Types.ObjectId,
        },
        text: {
            type: String
        },
        updatedAt: {
            type: Date
        },
        status: {
            type: String,
            enum: ['sent', "read"],
            default: 'sent'
        },
        messageId: {
            type: Schema.Types.ObjectId,
            ref: 'message'
        }
    },
    admin: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    },
    type: {
        type: String,
        enum: ['group', 'private'],
        default: 'private'
    },
    access: {
        type: String,
        enum: ["public", "private"],
        default: 'private'
    },
    depend: {
        id: {
            type: Schema.Types.ObjectId,
            refPath: 'chatInfo.depend.item',
            required: true
        },
        item: {
            type: String,
            enum: ['establishment', 'user', 'capl']
        },
    },
    chatName: {
        type: String
    },
    isAttached: {
        type: Boolean,
        default: false
    },
    picture: {
        type: String
    },
    members: [{
        user: {
            type: Schema.Types.ObjectId,
            ref: 'user',
        },
        showInfoAs: {
            item: {
                type: String,
                enum: ['establishment', 'user'],
                default: 'user'
            },
            id: {
                type: Schema.Types.ObjectId,
                refPath: 'members.showInfoAs.item',
                required: false,
                default: null
            }
        },
        connectedAt: Date,
    }]
}, {timestamps: true});

const Message = new Schema({
    conversationId: {
        type: Schema.Types.ObjectId,
        ref: 'conversation',
    },
    sender: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    },
    replyTo: {
        type: Schema.Types.ObjectId,
        ref: 'message',
        required: false,
        default: null
    },
    type: {
        type: String,
        enum: ['info', 'message'],
        default: 'message'
    },
    text: {
        type: String
    },
    files: [
        {
            name: {
                type: String
            },
            url: {
                type: String
            }
        }
    ],
    status: {
        type: String,
        enum: ['sent', 'delivered', 'read', 'error']
    },
    read: [
        {
            type: Schema.Types.ObjectId,
            ref: 'user'
        }
    ]
    // reactions: {
    //
    // }
}, {timestamps: true});

const ConversationModel: IConversationModel = model<IConversation, IConversationModel>('conversation', Conversation);
const MessageModel: IMessageModel = model<IMessage, IMessageModel>('message', Message);

export {
    ConversationModel,
    MessageModel,
}
