const {Schema, model} = require("mongoose");
const RatingSchema = new Schema({
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

module.exports = model('rating', RatingSchema);