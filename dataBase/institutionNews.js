const {model, Schema} = require("mongoose");

const InstitutionNewsSchema = new Schema({
    institutionId: {
        type: Schema.Types.ObjectId,
        ref: 'institution',
        required: true
    },
    photo: [{
        type: String
    }],
    video: {
        type: String
    },
    desc: {
        type: String,
        required: true
    }
}, {timestamps: true});

module.exports = model('institutionNews', InstitutionNewsSchema);