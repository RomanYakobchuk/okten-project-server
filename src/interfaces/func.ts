import {Request} from "express";
import {
    ICapl, ICityForCount,
    IComment, IConversation,
    IInstitution,
    IInstitutionNews, INotification,
    IOauth, IReaction, ISubscribe,
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
    subscribes?: {count: number, items: ISubscribe[]} | null,
    reservation?: ICapl,
    conversation?: IConversation,
    comments?: IComment[]
    comment?: IComment,
    reaction?: IReaction,
    isAuth?: boolean,
    userExist?: IUser,
    isAllowedNewReview?: boolean,
    files?: any,
    cityForCount?: ICityForCount,
    favPlaces?: {
        items: IUserFavoritePlaces[],
        count: number
    },
    notification?: INotification
}