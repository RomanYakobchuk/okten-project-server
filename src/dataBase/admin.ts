import {Schema, model} from "mongoose";
import {IAdmin} from "../interfaces/common";

const AdminSchema = new Schema<IAdmin>({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    },
}, {timestamps: true});

const Admin = model('admin', AdminSchema);

export {
    Admin
}