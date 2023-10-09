import {Schema, model} from "mongoose";
import {IManager} from "../interfaces/common";

const manager = new Schema<IManager>({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        unique: true
    },
    name: {
        type: String,
        required: true,
        default: ''
    },
    email: {
        type: String,
        required: true,
        default: '',
        unique: true
    },
    phone: {
        type: String,
        required: true,
        default: '',
        unique: true
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

const ManagerSchema = model('manager', manager);

export {
    ManagerSchema
}