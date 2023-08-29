import {Schema, model} from "mongoose";
import {IOauth} from "../interfaces/common";

const OAuth = new Schema<IOauth>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },

    access_token: {
        type: String,
        required: true
    },

    refresh_token: {
        type: String,
        required: true
    },
}, { timestamps: true });

const OauthSchema = model('oauth', OAuth);

export {
    OauthSchema
}