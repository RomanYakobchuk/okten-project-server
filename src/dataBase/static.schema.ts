import {Schema} from "mongoose";

const Static = new Schema({
    visits: {
        type: Number,
        default: 0
    },
    item: {
        type: Schema.Types.ObjectId,
        refPath: 'itemName'
    },
    itemName: {
        type: String,
        enum: ['establishment', 'establishmentNews']
    }
}, {timestamps: true});