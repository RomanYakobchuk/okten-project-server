const {Schema, model} = require("mongoose");
const ReviewsSchema = new Schema({
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
}, {timestamps: true})

module.exports = model('review', ReviewsSchema);