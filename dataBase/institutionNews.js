const {model, Schema} = require("mongoose");

const InstitutionNewsSchema = new Schema({
    institutionId: {
        type: Schema.Types.ObjectId,
        ref: 'institution',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    dateEvent: [{
        type: Object,
        date: Date,
        schedule: {
            type: Object,
            from: String,
            to: String,
        },
        time: {
            type: Object,
            from: Date,
            to: Date,
        }
    }],
    mainPhoto: {
       type: String
    },
    category: {
        type: String,
        default: "general"
    },
    photos: [{
        type: Object,
        required: true,
        url: {
            type: String
        },
        name: {
            type: String
        }
    }],
    description: {
        type: String,
        required: true
    },
    status: {
        type: String,
        default: "draft"
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true
    }
}, {timestamps: true});

module.exports = model('institutionNews', InstitutionNewsSchema);