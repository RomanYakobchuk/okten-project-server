import {NextFunction, Response} from "express";

import {IOauth, IUser, IUserFavoritePlaces} from "../interfaces/common";
import {UserFavoritePlacesService} from "../services";
import {CustomRequest} from "../interfaces/func";

class UserFavoritePlacesMiddleware {

    private userFavoritePlacesService: UserFavoritePlacesService;

    constructor() {
        this.userFavoritePlacesService = new UserFavoritePlacesService();

        this.checkUserFavPlaces = this.checkUserFavPlaces.bind(this);
    }

    checkUserFavPlaces = (type: "login" | "check" = 'check') => async (req: CustomRequest, res: Response, next: NextFunction) => {
        try {
            let user = {} as IUser;

            if (type === 'login') {
                user = req.user as IUser;
            } else if (type === 'check') {
                const {userId} = req.user as IOauth;
                user = userId as IUser;
            }
            let favPlaces = await this.userFavoritePlacesService.findOne({_id: user.favoritePlaces});

            if (!favPlaces) {
                favPlaces = await this.userFavoritePlacesService.create({userId: user._id});
                user.favoritePlaces = favPlaces._id;
                await user.save();
            }

            req.favPlaces = favPlaces;
            next();
        } catch (e) {

        }
    }

}

export default new UserFavoritePlacesMiddleware();