import {Schema, model} from "mongoose";
import {IReview} from "../interfaces/common";

const ReviewsSchema = new Schema<IReview>({
    institutionId: {
        type: Schema.Types.ObjectId,
        ref: 'institution'
    },
    reviews: [{
        type: Schema.Types.ObjectId,
        ref: 'reviewItem'
    }]
}, {timestamps: true});

const Reviews = model('reviews', ReviewsSchema);

export {
    Reviews
}