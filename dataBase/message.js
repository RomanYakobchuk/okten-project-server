const {Schema, model} = require("mongoose");
const ConversationSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    },
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
        }
    },
    managerId: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    },
    institutionTitle: {
        type: String
    }
}, {timestamps: true});

const MessageSchema = new Schema({
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
    }
}, {timestamps: true});

module.exports = {
    ConversationSchema: model('conversation', ConversationSchema),
    MessageSchema: model('message', MessageSchema),
}