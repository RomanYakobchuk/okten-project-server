import {Schema, model} from "mongoose";
import {IEstablishment} from "../interfaces/common";
import {IEstablishmentModel} from "../interfaces/model";

const Establishment = new Schema({
    title: {
        type: String,
        required: true
    },
    views: {
        type: Schema.Types.ObjectId,
        ref: 'views_container'
    },
    pictures: [{
        name: {
            type: String
        },
        url: {
            type: String
        }
    }],
    sendNotifications: {
        type: Boolean,
        default: false,
    },
    workSchedule: {
        type: Object,
        required: true,
        workDays: [{
            type: Array,
            days: {
                type: Object,
                from: {
                    type: Number
                },
                to: {
                    type: Number
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
            required: true,
        },
        address: {
            type: String,
            required: true
        }
    },
    type: {
        type: String,
        required: true,
    },
    cuisine: {
        type: String,
        default: undefined
    },
    description: {
        type: String,
        required: true
    },
    contacts: [{
        value: {
            type: String
        },
    }],
    tags: [{
        value: {
            type: String
        },
    }],
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
    features: [{
        value: {
            type: String
        },
    }],
    reviewsLength: {
        type: Number,
        default: 0
    },
    newsLength: {
        type: Number,
        default: 0
    },
    commentsLength: {
        type: Number,
        default: 0
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    freeSeats: {
        type: Schema.Types.ObjectId,
        ref: 'freeSeats',
        unique: true
    },
    reactions: {
        reaction: {
            type: Schema.Types.ObjectId,
            ref: 'reaction'
        }
    },
}, {timestamps: true});


const EstablishmentSchema: IEstablishmentModel = model<IEstablishment, IEstablishmentModel>('establishment', Establishment);

export {
    EstablishmentSchema
}
