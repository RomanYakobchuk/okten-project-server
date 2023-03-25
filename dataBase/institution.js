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
    otherPhoto: [{
        type: Object,
        required: true,
        url: {
            type: String
        },
        order: {
            type: String
        }
    }],
    workSchedule: {
        type: Object,
        required: true,
        workDays: [{
            type: Object,
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
        street: {
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
    ratings: [{
        type: Schema.Types.ObjectId,
        ref: 'rating',
    }],
    averageCheck: {
        type: String,
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
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'review'
        }
    ]
}, {timestamps: true})

module.exports = model('institution', InstitutionSchema);