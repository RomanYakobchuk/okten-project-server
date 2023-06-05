const {Schema, model} = require("mongoose");


const ViewsSchema = new Schema({
    refField: {
        type: String,
        required: true
    },
    viewsWith: {
        type: Schema.Types.ObjectId,
        refPath: 'refField',
        required: true
    },
    viewsNumber: {
        type: Number,
        default: 0
    },
    views: [
        {
            type: Schema.Types.ObjectId,
            ref: 'user'
        }
    ],
    verify: {
        type: String,
        default: 'draft'
    }
}, {timestamps: true})

ViewsSchema.statics.getTopComponents = async function (limit) {
    return await this.find({verify: {$regex: new RegExp('published', "i")}}).sort({['viewsNumber']: -1}).limit(limit).exec();
};

module.exports = model('views', ViewsSchema);

