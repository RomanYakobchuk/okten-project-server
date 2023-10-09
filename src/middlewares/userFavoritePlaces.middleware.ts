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

    checkUserFavPlaces = (type: "login" | "check" = 'check', by: "byUser" | "byId" = "byUser", allPlacesInfo: true | false = false) => async (req: CustomRequest, _: Response, next: NextFunction) => {
        try {
            let user = {} as IUser;

            if (by === 'byUser') {
                if (type === 'login') {
                    user = req.user as IUser;
                } else if (type === 'check') {
                    const {userId} = req.user as IOauth;
                    user = userId as IUser;
                }
            } else if (by === 'byId') {
                const {id} = req.params;
                user = await this.userService.findOneUser({_id: id}) as IUser;
                if (!user) {
                    return next(new CustomError('user not found', 404));
                }
            }
            let favPlaces: any;

            if (allPlacesInfo) {
                favPlaces = await this.userFavoritePlacesService
                    .findOne({_id: user.favoritePlaces})
                    .populate({path: 'places', select: "_id pictures averageCheck rating createdBy createdAt reviewsLength type place title"}).exec();
            } else {
                favPlaces = await this.userFavoritePlacesService.findOne({_id: user.favoritePlaces})
            }

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