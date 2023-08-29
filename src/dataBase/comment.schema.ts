import {Schema, model} from "mongoose";
import {IAnswerComment, IComment} from "../interfaces/common";
import {IAnswerCommentModel, ICommentModel} from "../interfaces/model";

const CommentItem = new Schema({
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

const AnswerCommentSchema: IAnswerCommentModel = model<IAnswerComment, IAnswerCommentModel>('answerComment', AnswerComment);
const CommentItemSchema: ICommentModel = model<IComment, ICommentModel>('commentItem', CommentItem);

export {
    AnswerCommentSchema,
    CommentItemSchema,
}