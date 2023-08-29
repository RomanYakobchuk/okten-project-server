import {Schema, model} from "mongoose";
import {IAdmin} from "../interfaces/common";

const Admin = new Schema<IAdmin>({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    },
}, {timestamps: true});

const AdminSchema = model('admin', Admin);

export {
    AdminSchema
}