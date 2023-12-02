import {model, Schema} from "mongoose";
import {INotification} from "../interfaces/common";
import {INotificationModel} from "../interfaces/model";

const NotificationSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    },
    forUser: {
        role: {
            type: String,
            enum: ['manager', 'user', 'admin']
        },
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'user'
        }
    },
    isDelete: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        enum: ["usual", "accepted", "rejected"],
        default: 'usual'
    },
    message: {
        type: String,
    },
    description: {
        type: String
    },
    isRead: {
        type: Boolean
    },
    type: {
        type: String
    }
}, {timestamps: true});

const Notification = model<INotification, INotificationModel>('notification', NotificationSchema);

export {
    Notification
}