import {Schema, model} from "mongoose";
import {IOauth} from "../interfaces/common";
import {IOAuthModel} from "../interfaces/model";

const OAuth = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true,
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


const OauthSchema: IOAuthModel = model<IOauth, IOAuthModel>('oauth', OAuth);

export {
    OauthSchema
}