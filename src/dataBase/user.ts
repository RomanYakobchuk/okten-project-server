import {Schema, model, Model} from "mongoose";
import {IUser} from "../interfaces/common";
import {UserModel} from "../interfaces/model";

const UserSchema = new Schema<IUser>({
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
        status: {
            type: String,
            default: 'user' //manager, admin
        },
        dOB: {
            type: Date,
            required: true,
        },
        password: {
            type: String,
            required: true
        },
        phone: {
            type: String,
            required: true
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
        favoritePlaces: {
            type: Schema.Types.ObjectId,
            ref: "userFavoritePlaces"
        },
        favoriteNews: [
            {
                type: Schema.Types.ObjectId,
                ref: 'institutionNews'
            }
        ],
        myRatings: [
            {
                type: Schema.Types.ObjectId,
                ref: "rating"
            }
        ],
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
const User: UserModel = model<IUser, UserModel>('user', UserSchema);
export {
    User
};
