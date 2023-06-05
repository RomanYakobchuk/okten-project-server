const {Schema, model} = require("mongoose");
const ReviewItemSchema = new Schema({
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
    review: {
        type: Schema.Types.ObjectId,
        ref: 'reviews'
    }
}, {timestamps: true})

module.exports = model('reviewItem', ReviewItemSchema);