const {Schema, model} = require("mongoose");

const MenuSchema = new Schema({
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
}, {timestamps: true})

module.exports = model("menu", MenuSchema);