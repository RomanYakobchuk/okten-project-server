const {Schema, model} = require("mongoose");

const ActionSchema = new Schema({
        actionType: {
            type: String,
            required: true
        },
        person: {
            type: Schema.Types.ObjectId,
            ref: 'user',
            required: true
        },
        actionWith: {
            type: Schema.Types.ObjectId,
            ref: String
        }
    }, {
        timestamps: true
    }
)


module.exports = model('action', ActionSchema);