import {Schema, model} from "mongoose";
import {IManager} from "../interfaces/common";

const managerSchema = new Schema<IManager>({
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
}, {timestamps: true});

const Manager = model('manager', managerSchema);

export {
    Manager
}