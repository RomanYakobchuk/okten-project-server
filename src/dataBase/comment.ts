import {Schema, model} from "mongoose";
import {IAnswerComment, IComment} from "../interfaces/common";
import {IAnswerCommentModel, ICommentModel} from "../interfaces/model";

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

const AnswerCommentSchema = new Schema({
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

const AnswerComment: IAnswerCommentModel = model<IAnswerComment, IAnswerCommentModel>('answerComment', AnswerCommentSchema);
const CommentItem: ICommentModel = model<IComment, ICommentModel>('commentItem', CommentItemSchema);

export {
    AnswerComment,
    CommentItem,
}