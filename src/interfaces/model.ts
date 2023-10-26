import {Model} from "mongoose";
import {IUserFavoritePlacesDoc} from "./doc";
import {
    IUser,
    IInstitutionNews,
    ICapl,
    IComment,
    IMessage,
    IConversation,
    ICityForCount, ISubscribe, INotification, IInstitution, IFreeSeats, IOauth
} from "./common";

export interface IUserFavoritePlacesModel extends Model<IUserFavoritePlacesDoc> {
}

export interface UserModel extends Model<IUser> {
}

export interface IInstitutionModel extends Model<IInstitution> {
}

export interface IFreeSeatsModel extends Model<IFreeSeats> {
}

export interface IInstitutionNewsModel extends Model<IInstitutionNews> {
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

export interface INotificationModel extends Model<INotification> {
}

export interface IOAuthModel extends Model<IOauth> {
}