const {Schema, model} = require("mongoose");

const ReviewsSchema = new Schema({
    institutionId: {
        type: Schema.Types.ObjectId,
        ref: 'institution'
    },
    reviews: [{
        type: Schema.Types.ObjectId,
        ref: 'reviewItem'
    }]
}, {timestamps: true});

module.exports = model('reviews', ReviewsSchema);