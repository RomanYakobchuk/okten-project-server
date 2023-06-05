const {Schema, model} = require("mongoose");

const MenuItemSchema = new Schema({
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

module.exports = model("menuItem", MenuItemSchema)