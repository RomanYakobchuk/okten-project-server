import {Model} from "mongoose";
import {IUserFavoritePlacesDoc} from "./doc";
import {
    IUser,
    IEstablishmentNews,
    ICapl,
    IComment,
    IMessage,
    IConversation,
    ICityForCount, ISubscribe, INotification, IEstablishment, IFreeSeats, IOauth, INotificationSubscribe, IReaction
} from "./common";

export interface IUserFavoritePlacesModel extends Model<IUserFavoritePlacesDoc> {
}

export interface UserModel extends Model<IUser> {
}

export interface IEstablishmentModel extends Model<IEstablishment> {
}

export interface IFreeSeatsModel extends Model<IFreeSeats> {
}

export interface IEstablishmentNewsModel extends Model<IEstablishmentNews> {
}

export interface ICaplModel extends Model<ICapl> {
}

export interface ICommentModel extends Model<IComment> {
}

export interface IMessageModel extends Model<IMessage> {
}

export interface IConversationModel extends Model<IConversation> {
}

export interface ICityForCountModel extends Model<ICityForCount> {
}

export interface ISubscribeModel extends Model<ISubscribe> {
}

export interface INotificationSubscribeModel extends Model<INotificationSubscribe> {
}

export interface INotificationModel extends Model<INotification> {
}

export interface IOAuthModel extends Model<IOauth> {
}

export interface IReactionModel extends Model<IReaction> {
}