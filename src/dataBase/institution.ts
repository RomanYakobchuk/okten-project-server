import {Schema, model, Model} from "mongoose";
import {IInstitution} from "../interfaces/common";

export interface IInstitutionModel extends Model<IInstitution> {}
const InstitutionSchema = new Schema({
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

const Institution: IInstitutionModel = model<IInstitution, IInstitutionModel>('institution', InstitutionSchema);

export {
    Institution
}
