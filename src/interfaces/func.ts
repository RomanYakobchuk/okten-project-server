import {Request} from "express";
import {
    IAnswerComment,
    ICapl,
    IComment, IConversation,
    IInstitution,
    IInstitutionNews,
    IOauth, ISubscribe,
    IUser,
    IUserFavoritePlaces
} from "./common";
import {UserModel} from "./model";

export interface CustomRequest extends Request {
    user?: IUser | IOauth | UserModel,
    data_info?: IInstitution,
    news?: IInstitutionNews,
    newStatus?: "admin" | "manager" | "user",
    tokenInfo?: IOauth,
    subscribe?: ISubscribe | null,
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