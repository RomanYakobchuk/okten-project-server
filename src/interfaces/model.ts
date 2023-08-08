import {Model} from "mongoose";
import {IUserFavoritePlacesDoc} from "./doc";
import {IUser, IInstitutionNews, ICapl, IComment, IAnswerComment, IMessage, IConversation} from "./common";

export interface IUserFavoritePlacesModel extends Model<IUserFavoritePlacesDoc>{}

export interface UserModel extends Model<IUser>{}

export interface IInstitutionNewsModel extends Model<IInstitutionNews> {}

export interface ICaplModel extends Model<ICapl>{}

export interface ICommentModel extends Model<IComment> {}

export interface IAnswerCommentModel extends Model<IAnswerComment> {}

export interface IMessageModel extends Model<IMessage>{}
export interface IConversationModel extends Model<IConversation>{}