const {Schema, model} = require("mongoose");

const InstitutionSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    mainPhoto: {
        type: String,
        default: ""
    },
    variantForDisplay: {
        type: String,
        default: '1'
    },
    views: {
        type: Schema.Types.ObjectId,
        ref: 'views'
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
    workSchedule: {
        type: Object,
        required: true,
        workDays: [{
            type: Array,
            days: {
                type: Object,
                from: {
                    type: String
                },
                to: {
                    type: String
                },
            },
            time: {
                type: Object,
                from: {
                    type: Date
                },
                to: {
                    type: Date
                },
            }
        }],
        weekend: {
            type: String,
        }
    },
    location: {
        type: Object,
        lng: {
            type: Number,
            required: true
        },
        lat: {
            type: Number,
            required: true
        }
    },
    place: {
        type: Object,
        city: {
            type: String,
            required: true
        },
        address: {
            type: String,
            required: true
        }
    },
    type: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    contacts: {
        type: Object,
        value: {
            type: String
        },
    },
    tags: {
        type: Object,
        value: {
            type: String
        },
    },
    verify: {
        type: String,
        default: "draft"
    },
    verifyBy: {
        type: Schema.Types.ObjectId,
        ref: 'user',
    },
    rating: {
        type: Number,
        default: 0,
    },
    averageCheck: {
        type: Number,
    },
    features: {
        type: Object,
        value: {
            type: String
        },
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    news: [{
        type: Schema.Types.ObjectId,
        ref: 'institutionNews',
    }],
}, {timestamps: true})

module.exports = model('institution', InstitutionSchema);