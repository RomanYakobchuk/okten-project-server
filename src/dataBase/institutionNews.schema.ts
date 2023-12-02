import {Schema, model} from "mongoose";
import {IInstitutionNews} from "../interfaces/common";
import {IInstitutionNewsModel} from "../interfaces/model";

const InstitutionNews = new Schema<IInstitutionNews>({
    institutionId: {
        type: Schema.Types.ObjectId,
        ref: 'institution',
        required: true,
    },
    title: {
        type: String,
        required: true
    },
    place: {
        location: {
            lng: {
                type: Number,
            },
            lat: {
                type: Number,
            }
        },
        place: {
            city: {
                type: String,
            },
            address: {
                type: String,
            }
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

const InstitutionNewsSchema: IInstitutionNewsModel = model<IInstitutionNews, IInstitutionNewsModel>('institutionNews', InstitutionNews);

export {
    InstitutionNewsSchema
}