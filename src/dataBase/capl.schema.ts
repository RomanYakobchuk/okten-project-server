import {Schema, model} from "mongoose";
import {ICapl} from "../interfaces/common";
import {ICaplModel} from "../interfaces/model";

const Capl = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    manager: {
        type: Schema.Types.ObjectId,
        ref: 'manager',
        required: true
    },
    fullName: {
        type: String,
        required: true
    },
    establishment: {
        type: Schema.Types.ObjectId,
        ref: 'establishment',
        required: true
    },
    eventType: {
        type: String
    },
    date: {
        type: Date,
        required: true
    },
    comment: {
        type: String
    },
    writeMe: {
        type: Boolean
    },
    desiredAmount: {
        type: Number,
        required: true
    },
    numberPeople: {
        type: Number,
        required: true
    },
    whoPay: {
        type: String
    },
    userStatus: {
        value: {
            type: String,
            default: 'accepted' // rejected | accepted
        },
        reasonRefusal: {
            type: String
        }
    },
    isAllowedEdit: {
        type: Boolean,
        default: true
    },
    establishmentStatus: {
        value: {
            type: String,
            default: 'draft' // draft | rejected | accepted
        },
        freeDateFor: [Date],
        reasonRefusal: {
            type: String
        }
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isClientAppeared: {
        type: Boolean,
        default: false
    }
}, {timestamps: true});


const CaplSchema: ICaplModel = model<ICapl, ICaplModel>("capl", Capl);

export {
    CaplSchema
}