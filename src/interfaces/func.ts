import {Request} from "express";
import {
    IAnswerComment,
    ICapl,
    IComment, IConversation,
    IInstitution,
    IInstitutionNews,
    IOauth,
    IUser,
    IUserFavoritePlaces
} from "./common";
import {UserModel} from "./model";

export interface CustomRequest extends Request {
    user?: IUser | IOauth | UserModel,
    data_info?: IInstitution | IInstitutionNews,
    newStatus?: "admin" | "manager" | "user",
    tokenInfo?: IOauth,
    reservation?: ICapl,
    conversation?: IConversation,
    comments?: IComment[]
    comment?: IAnswerComment | IComment,
    isAuth?: boolean,
    userExist?: IUser,
    isAllowedNewReview?: boolean,
    files?: any,
    favPlaces?: IUserFavoritePlaces
}