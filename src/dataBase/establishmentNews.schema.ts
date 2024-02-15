import {Schema, model} from "mongoose";
import {IEstablishmentNews} from "../interfaces/common";
import {IEstablishmentNewsModel} from "../interfaces/model";

const EstablishmentNews = new Schema<IEstablishmentNews>({
    establishmentId: {
        type: Schema.Types.ObjectId,
        ref: 'establishment',
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

const EstablishmentNewsSchema: IEstablishmentNewsModel = model<IEstablishmentNews, IEstablishmentNewsModel>('establishmentNews', EstablishmentNews);

export {
    EstablishmentNewsSchema
}