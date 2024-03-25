import {Schema, model} from "mongoose";
import {IReviewItem} from "../interfaces/common";
import {IReviewItemModel} from "../interfaces/model";

const ReviewItem = new Schema({
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: "user"
    },
    text: {
        type: String,
    },
    title: {
        type: String
    },
    score: {
        type: Number,
        min: 1,
        max: 5
    },
    atmosphere: {
        type: Number,
        min: 1,
        max: 5
    },
    service: {
        type: Number,
        min: 1,
        max: 5
    },
    quality: {
        type: Number,
        min: 1,
        max: 5
    },
    establishmentId: {
        type: Schema.Types.ObjectId,
        ref: "establishment"
    },
}, {timestamps: true});

const ReviewItemSchema = model<IReviewItem, IReviewItemModel>('reviewItem', ReviewItem);

export {
    ReviewItemSchema
}