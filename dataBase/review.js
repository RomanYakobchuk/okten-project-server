const {Schema, model} = require("mongoose");
const ReviewSchema = new Schema({
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: "user"
    },
    text: {
        type: String
    },
    toInstitution: {
        type: Schema.Types.ObjectId,
        ref: "institution"
    },
    grade: {
        type: Number
    }
}, {timestamps: true})

module.exports = model('review', ReviewSchema);