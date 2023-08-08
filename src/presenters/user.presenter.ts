import {IUser} from "../interfaces/common";

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
        favoritePlaces: user.favoritePlaces,
        allInstitutions: user.allInstitutions,
        status: user.status
    }
}

export {
    userPresenter
};