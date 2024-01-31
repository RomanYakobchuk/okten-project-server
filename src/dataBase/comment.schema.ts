import {Schema, model} from "mongoose";
import {IComment} from "../interfaces/common";
import {ICommentModel} from "../interfaces/model";

const CommentItem = new Schema({
    createdBy: {
        type: Schema.Types.ObjectId,
        refPath: "refFieldCreate",
        required: true
    },
    refFieldCreate: {
        type: String,
        required: true,
    },
    text: {
        type: String,
        required: true
    },
    establishmentId: {
        type: Schema.Types.ObjectId,
        ref: "institution"
    },
    parentId: {
        type: Schema.Types.ObjectId,
        ref: 'commentItem'
    },
    repliesLength: {
        type: Number,
        default: 0
    },
    reactions: {
        type: Schema.Types.ObjectId,
        ref: 'reaction'
    }
}, {timestamps: true});


const CommentItemSchema: ICommentModel = model<IComment, ICommentModel>('commentItem', CommentItem);

export {
    CommentItemSchema,
}