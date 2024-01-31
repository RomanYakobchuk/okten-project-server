import {IObjectIdArray, IUser, IUserFavoritePlaces} from "../interfaces/common";
import {ObjectId} from "mongoose";

const userPresenter = (user: IUser) => {
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
        favoritePlaces: user.favoritePlaces as string | string & ObjectId | IUserFavoritePlaces | IObjectIdArray,
        allInstitutions: user.allInstitutions,
        status: user.status,
        uniqueIndicator: user.uniqueIndicator
    }
}

export {
    userPresenter
};