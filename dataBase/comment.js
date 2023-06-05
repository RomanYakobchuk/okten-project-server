const {Schema, model} = require("mongoose");
const CommentItemSchema = new Schema({
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: "user"
    },
    text: {
        type: String
    },
    institutionId: {
        type: Schema.Types.ObjectId,
        ref: "institution"
    },
    replies: [{
        type: Schema.Types.ObjectId,
        ref: 'answerComment'
    }]
}, {timestamps: true});

const AnswerComment = new Schema({
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: "user"
    },
    text: {
        type: String
    },
    parentCommentId: {
        type: Schema.Types.ObjectId,
        ref: 'commentItem'
    },
}, {timestamps: true})


module.exports = {
    AnswerComment: model('answerComment', AnswerComment),
    CommentItem: model('commentItem', CommentItemSchema),
}