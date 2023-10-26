import {NextFunction, Response} from "express";

import {IOauth, IUser} from "../interfaces/common";
import {UserFavoritePlacesService, UserService} from "../services";
import {CustomRequest} from "../interfaces/func";
import {CustomError} from "../errors";

class UserFavoritePlacesMiddleware {

    private userFavoritePlacesService: UserFavoritePlacesService;
    private userService: UserService;

    constructor() {
        this.userFavoritePlacesService = new UserFavoritePlacesService();
        this.userService = new UserService();

        this.checkUserFavPlaces = this.checkUserFavPlaces.bind(this);
    }

    checkUserFavPlaces = (type: "user" | "tokenInfo" = 'user', by: "byUser" | "byId" = "byUser", isObj: boolean = false) => async (req: CustomRequest, _: Response, next: NextFunction) => {
        try {
            let user = {} as IUser;

            if (by === 'byUser') {
                if (isObj) {
                    const {userId} = req[type] as IOauth;
                    user = userId as IUser;
                } else {
                    user = req.user as IUser;
                }
            } else if (by === 'byId') {
                const {id} = req.params;
                user = await this.userService.findOneUser({_id: id}) as IUser;
                if (!user) {
                    return next(new CustomError('user not found', 404));
                }
            }
            let favPlaces = await this.userFavoritePlacesService.findOne({_id: user?.favoritePlaces})

            if (!favPlaces) {
                await this.userFavoritePlacesService.deleteOne({userId: user?._id});
                favPlaces = await this.userFavoritePlacesService.create({userId: user._id});
                user.favoritePlaces = favPlaces._id;
                await this.userService.updateOneUser({_id: user?._id}, {favoritePlaces: favPlaces?._id});
            }

            req.favPlaces = favPlaces;
            next();
        } catch (e) {

        }
    }

}

export default new UserFavoritePlacesMiddleware();