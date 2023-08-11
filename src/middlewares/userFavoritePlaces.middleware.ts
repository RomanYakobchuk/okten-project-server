import {NextFunction, Response} from "express";

import {IOauth, IUser, IUserFavoritePlaces} from "../interfaces/common";
import {UserFavoritePlacesService} from "../services";
import {CustomRequest} from "../interfaces/func";

class UserFavoritePlacesMiddleware {

    private userFavoritePlacesService:  UserFavoritePlacesService;

    constructor() {
        this.userFavoritePlacesService = new UserFavoritePlacesService();

        this.checkUserFavPlaces = this.checkUserFavPlaces.bind(this);
    }

    async checkUserFavPlaces(req: CustomRequest, res: Response, next: NextFunction) {
        const {userId} = req.user as IOauth;
        const user = userId as IUser;
        try {
            let favPlaces = await this.userFavoritePlacesService.findOne({_id: user.favoritePlaces});

            if (!favPlaces) {
                favPlaces = await this.userFavoritePlacesService.create({userId: user._id});
            }

            req.favPlaces = favPlaces;
            next();
        } catch (e) {

        }
    }

}

export default new UserFavoritePlacesMiddleware();