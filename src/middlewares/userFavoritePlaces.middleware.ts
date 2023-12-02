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
        this.getSavedPlaces = this.getSavedPlaces.bind(this);
        this.checkOne = this.checkOne.bind(this);
    }

    checkUserFavPlaces = (type: "user" | "tokenInfo" = 'user', by: "byUser" | "byId" = "byUser", isObj: boolean = false) => async (req: CustomRequest, _: Response, next: NextFunction) => {
        try {
            let user = {} as IUser;

            if (by === 'byId' && user?.status === 'admin') {
                const {id} = req.params;
                user = await this.userService.findOneUser({_id: id}) as IUser;
                if (!user) {
                    return next(new CustomError('user not found', 404));
                }
            } else {
                if (isObj) {
                    const {userId} = req[type] as IOauth;
                    user = userId as IUser;
                } else {
                    user = req.user as IUser;
                }
            }
            // const savedPlaces = await this.userFavoritePlacesService.findWithQuery()
            let favPlaces = await this.userFavoritePlacesService.findOne({_id: user?.favoritePlaces})?.populate({path: 'places.item', select: (doc) => {
                if (doc.type === 'institution') {
                    return '_id type pictures title '
                }
                }})

            // if (!favPlaces) {
            //     await this.userFavoritePlacesService.deleteOne({userId: user?._id});
            //     favPlaces = await this.userFavoritePlacesService.create({userId: user._id});
            //     user.favoritePlaces = favPlaces._id;
            //     await this.userService.updateOneUser({_id: user?._id}, {favoritePlaces: favPlaces?._id});
            // }

            // req.favPlaces = favPlaces;
            next();
        } catch (e) {
            next(e);
        }
    }

    getSavedPlaces = (variant: "withData" | "withoutData" = "withoutData") => async (req: CustomRequest, res: Response, next: NextFunction) => {
        let {_end, _start, type, userId} = req.query;
        const {userId: currentUser} = req.user as IOauth;
        const user = currentUser as IUser;
        const newStatus = req.newStatus;
        try {
            if (!_end) {
                _end = '100';
            }
            if (!_start) {
                _start = '0'
            }
            if (newStatus !== 'admin' || !userId) {
                userId = user?._id
            }
            const {count, items} = await this.userFavoritePlacesService.findWithQuery(Number(_end), Number(_start), type as string, userId as string, variant);

            req.favPlaces = {
                count: count,
                items: items
            }
            next();
        } catch (e) {
            next(e);
        }
    }
    async checkOne(req: CustomRequest, res: Response, next: NextFunction) {
        const {userId} = req.user as IOauth;
        const user = userId as IUser;

        const {refPath, placeId} = req.body;
        try {
            req.body.savedPlace = await this.userFavoritePlacesService.findOne({type: refPath, userId: user?._id, item: placeId});
            next();
        } catch (e) {
            next(e);
        }
    }
}

export default new UserFavoritePlacesMiddleware();