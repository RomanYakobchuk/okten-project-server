import {Schema, model} from "mongoose";
import {IMenuItem} from "../interfaces/common";

const MenuItemSchema = new Schema<IMenuItem>({
    description: String,
    establishmentId: {
        type: Schema.Types.ObjectId,
        ref: 'establishment'
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