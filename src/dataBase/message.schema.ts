import {Schema, model} from "mongoose";
import {IMessage, IConversation} from "../interfaces/common";
import {IConversationModel, IMessageModel} from "../interfaces/model";

const Conversation = new Schema({
    userName: {
        type: String
    },
    institutionId: {
        type: Schema.Types.ObjectId,
        ref: 'institution'
    },
    lastMessage: {
        sender: {
            type: Schema.Types.ObjectId,
        },
        text: {
            type: String
        },
        updatedAt: {
            type: Date
        }
    },
    members: [{
        user: Schema.Types.ObjectId,
        connectedAt: Date,
        role: String
    }],
    institutionTitle: {
        type: String
    },
}, {timestamps: true});

const Message = new Schema({
    conversationId: {
        type: Schema.Types.ObjectId,
        ref: 'conversation'
    },
    sender: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    },
    replyTo: {
        type: Schema.Types.ObjectId,
        ref: 'message',
        default: ''
    },
    pictures: [
        {
            type: String
        }
    ],
    text: {
        type: String
    },
    isSent: {
        type: Boolean,
        default: false,
    },
    isDelivered: {
        type: Boolean,
        default: false,
    },
    isRead: {
        type: Boolean,
        default: false,
    },
    isError: {
        type: Boolean,
        default: false,
    },
}, {timestamps: true});

const ConversationModel: IConversationModel = model<IConversation, IConversationModel>('conversation', Conversation);
const MessageModel: IMessageModel = model<IMessage, IMessageModel>('message', Message);

export {
    ConversationModel,
    MessageModel,
}
