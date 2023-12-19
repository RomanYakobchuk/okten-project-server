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
        }
    },
    chatInfo: {
        type: {
            type: String,
            enum: ['group', 'oneByOne']
        },
        status: {
            type: String,
            enum: ["public", "private"]
        },
        field: {
            name: {
                type: String,
                enum: ['institution', 'user', 'capl']
            },
            id: {
                type: Schema.Types.ObjectId,
                refPath: 'chatInfo.field.name',
                required: false
            },
        },
        chatName: {
            type: String
        },
        picture: {
            type: String
        },
        creator: {
            type: Schema.Types.ObjectId,
            ref: 'user'
        }
    },
    members: [{
        user: {
            type: Schema.Types.ObjectId,
            ref: 'user'
        },
        connectedAt: Date,
        conversationTitle: String,
        role: String
    }]
}, {timestamps: true});

const Message = new Schema({
    conversationId: {
        type: Schema.Types.ObjectId,
        ref: 'conversation',
        unique: true
    },
    sender: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    },
    replyTo: {
        type: Schema.Types.ObjectId,
        ref: 'message',
        required: false
    },
    pictures: [
        {
            type: String
        }
    ],
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
