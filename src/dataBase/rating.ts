import {Schema, model} from "mongoose";
import {IRating} from "../interfaces/common";

const RatingSchema = new Schema<IRating>({
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: "user"
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
}, {timestamps: true})

const Rating = model('rating', RatingSchema)

export {
    Rating
}