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
    place: {
        type: Object,
        isPlace: Boolean,
        location: {
            type: Object,
            lng: {
                type: Number,
            },
            lat: {
                type: Number,
            }
        },
        city: {
            type: String,
            required: true
        },
        address: {
            type: String,
            required: true
        }
    },
    publishAt: {
        isPublish: {
            type: Boolean
        },
        datePublish: {
            type: Date
        }
    },
    dateEvent: [{
        type: Object,
        schedule: {
            type: Object,
            from: Date,
            to: Date,
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
    otherPhoto: [{
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
    },
    variantForDisplay: {
        type: String,
        default: '1'
    },
}, {timestamps: true});

module.exports = model('institutionNews', InstitutionNewsSchema);