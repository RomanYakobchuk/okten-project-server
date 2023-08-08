import {Schema, model} from "mongoose";
import {IMenuItem} from "../interfaces/common";

const MenuItemSchema = new Schema<IMenuItem>({
    description: String,
    institutionId: {
        type: Schema.Types.ObjectId,
        ref: 'institution'
    },
    title: String,
    category: String,
    weight: Number,
    price: Number,
    image: String
}, {timestamps: true});

const MenuItem = model("menuItem", MenuItemSchema);

export {
    MenuItem
}