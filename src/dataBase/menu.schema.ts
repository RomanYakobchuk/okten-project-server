import {Schema, model} from "mongoose";
import {IMenu} from "../interfaces/common";

const Menu = new Schema<IMenu>({
    institutionId: {
        type: Schema.Types.ObjectId,
        ref: 'institution'
    },
    items: [{
        type: Schema.Types.ObjectId,
        ref: 'menuItem'
    }],
    fileMenu: {
        type: String,
        default: ''
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    }
}, {timestamps: true});

const MenuSchema = model("menu", Menu);

export {
    MenuSchema
}