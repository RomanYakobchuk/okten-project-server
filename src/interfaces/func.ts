import {Request} from "express";
import {
    ICapl, ICityForCount,
    IComment, IConversation,
    IEstablishment,
    IEstablishmentNews, INotification,
    IOauth, IReaction, ISubscribe,
    IUser, IUserAgent,
    IUserFavoritePlaces
} from "./common";
import {UserModel} from "./model";
import {reformatChat} from "../services/conversation.service";

export interface CustomRequest extends Request {
    user?: IUser | IOauth | UserModel,
    data_info?: IEstablishment,
    news?: IEstablishmentNews,
    newStatus?: "admin" | "manager" | "user",
    tokenInfo?: IOauth,
    subscribe?: ISubscribe | null,
    subscribes?: { count: number, items: ISubscribe[] } | null,
    reservation?: ICapl,
    conversation?: IConversation | ReturnType<typeof reformatChat>,
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
    notification?: INotification,
    userAgent?: IUserAgent,
    sessions?: IOauth[],
    averageCheckMinMax?: IAverageCheckMinMax[]
}

export interface IAverageCheckMinMax {
    minValue: number,
    maxValue: number
}