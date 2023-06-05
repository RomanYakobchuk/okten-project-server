const {Schema, model} = require("mongoose");
const managerSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    },
    name: {
        type: String,
        required: true,
        default: ''
    },
    email: {
        type: String,
        required: true,
        default: ''
    },
    phone: {
        type: String,
        required: true,
        default: ''
    },
    verify: {
        verifyBy: {
            type: Schema.Types.ObjectId,
            ref: 'user'
        },
        verifyDate: {
            type: Date
        },
        isVerify: {
            type: Boolean,
            default: false
        }
    }
}, {timestamps: true})


module.exports = model('manager', managerSchema);