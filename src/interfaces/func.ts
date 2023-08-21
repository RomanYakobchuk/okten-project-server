import {Request} from "express";
import {
    IAnswerComment,
    ICapl,
    IComment,
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
    comments?: IComment[]
    comment?: IAnswerComment | IComment,
    [key: string]: any,
    userExist?: IUser,
    files?: any,
    favPlaces?: IUserFavoritePlaces
}