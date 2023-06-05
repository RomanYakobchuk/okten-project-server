const {Schema, model} = require("mongoose");
const AdminSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    },
}, {timestamps: true});

module.exports = model('admin', AdminSchema);