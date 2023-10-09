import {Schema, model} from "mongoose";
import {IAdmin} from "../interfaces/common";

const Admin = new Schema<IAdmin>({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        unique: true
    },
}, {timestamps: true});

const AdminSchema = model('admin', Admin);

export {
    AdminSchema
}