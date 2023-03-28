const {Schema, model} = require("mongoose");
const CommentSchema = new Schema({
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

module.exports = model('comment', CommentSchema);