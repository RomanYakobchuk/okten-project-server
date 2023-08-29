import {Schema, model} from "mongoose";
import {IReviewItem} from "../interfaces/common";

const ReviewItem = new Schema<IReviewItem>({
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: "user"
    },
    text: {
        type: Object,
        like: String,
        notLike: String
    },
    grade: {
        type: Number,
        min: 1,
        max: 5
    },
    institutionId: {
        type: Schema.Types.ObjectId,
        ref: "institution"
    },
}, {timestamps: true});

const ReviewItemSchema = model('reviewItem', ReviewItem);

export {
    ReviewItemSchema
}