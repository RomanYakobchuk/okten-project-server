import {IObjectIdArray, IUser, IUserFavoritePlaces} from "../interfaces/common";
import {ObjectId, Schema} from "mongoose";

const userPresenter = (user: IUser): IUser => {
    return {
        _id: user._id,
        name: user.name,
        email: user.email,
        dOB: user.dOB,
        isActivated: user.isActivated,
        avatar: user.avatar,
        phone: user.phone,
        phoneVerify: user.phoneVerify,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        favoritePlaces: user.favoritePlaces as string | string & ObjectId | Schema.Types.ObjectId | IUserFavoritePlaces | IObjectIdArray,
        status: user.status,
        uniqueIndicator: user.uniqueIndicator
    } as IUser
}

export {
    userPresenter
};