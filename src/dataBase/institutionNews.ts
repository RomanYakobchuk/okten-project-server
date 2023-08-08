import {Schema, model} from "mongoose";
import {IInstitutionNews} from "../interfaces/common";
import {IInstitutionNewsModel} from "../interfaces/model";

const InstitutionNewsSchema = new Schema<IInstitutionNews>({
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
    category: {
        type: String,
        default: "general"
    },
    pictures: [{
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
}, {timestamps: true});

const InstitutionNews: IInstitutionNewsModel =model<IInstitutionNews, IInstitutionNewsModel>('institutionNews', InstitutionNewsSchema);

export {
    InstitutionNews
}