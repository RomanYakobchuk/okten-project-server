import {model, Schema} from "mongoose";
import {INotificationSubscribe, ISubscribe} from "../interfaces/common";
import {INotificationSubscribeModel, ISubscribeModel} from "../interfaces/model";

const Subscribe = new Schema({
    institutionId: {
        type: Schema.Types.ObjectId,
        ref: 'institution',
    },
    subscriberId: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    }
}, {timestamps: true});

const Notification = new Schema({
    subscribeId: {
        type: Schema.Types.ObjectId,
        ref: 'subscribe'
    },
    newsId: {
        type: Schema.Types.ObjectId,
        ref: 'institutionNews'
    }
}, {timestamps: true});

const SubscribeSchema: ISubscribeModel = model<ISubscribe, ISubscribeModel>('subscribe', Subscribe);
const NotificationSubscribeSchema: INotificationSubscribeModel = model<INotificationSubscribe, INotificationSubscribeModel>('notificationSubscribe', Notification);

export {
    SubscribeSchema,
    NotificationSubscribeSchema
}