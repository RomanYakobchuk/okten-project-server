import {ObjectId} from "mongoose";
import {IUserFavoritePlaces} from "./common";

export interface IUserFavoritePlacesDoc extends IUserFavoritePlaces {
    _id: string | string & ObjectId,
    createdAt?: Date,
    updatedAt?: Date,
}