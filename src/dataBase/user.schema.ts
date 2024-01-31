import {Schema, model} from "mongoose";
import {IUser} from "../interfaces/common";
import {UserModel} from "../interfaces/model";

const User = new Schema<IUser>({
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            unique: true,
            required: true,
            trim: true,
            lowercase: true
        },
        uniqueIndicator: {
            value: {
                type: String,
                unique: true,
                required: false
            },
            type: {
                type: String,
                enum: ["public", "private"]
            }
        },
        status: {
            type: String,
            enum: ['user', 'admin', 'manager'],
            default: 'user'
        },
        dOB: {
            type: Date,
        },
        password: {
            type: String,
        },
        phone: {
            type: String,
            unique: true
        },
        avatar: {
            type: String,
            default: ""
        },
        isActivated: {
            type: Boolean,
            default: false  // by gmail
        },
        phoneVerify: {
            type: Boolean,
            default: false // by phone
        },
        verifyCode: {
            type: String //code for verify number
        },
        activationLink: {
            type: String //link for activate account by mail
        },
        allInstitutions: [
            {
                type: Schema.Types.ObjectId,
                ref: "institution"
            }
        ],
        registerBy: {
            type: String,
            enum: ['Email', 'Google', 'Facebook'],
            default: 'Email'
        },
        blocked: {
            isBlocked: {
                type: Boolean,
                default: false,
            },
            whyBlock: {
                type: String,
                default: ''
            }
        }
    },
    {
        timestamps: true
    }
);
const UserSchema: UserModel = model<IUser, UserModel>('user', User);
export {
    UserSchema
};
