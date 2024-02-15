import {NextFunction, Response} from "express";

import {CustomRequest} from "../interfaces/func";
import {IEstablishment, IEstablishmentNews, IOauth, IUser} from "../interfaces/common";
import {UserFavoritePlacesService} from "../services";
import {ObjectId} from "mongoose";


class SavedPlacesController {
    private userFavoritePlacesService: UserFavoritePlacesService;
    constructor() {
        this.userFavoritePlacesService = new UserFavoritePlacesService();

        this.savePlace = this.savePlace.bind(this);
        this.getUserFavPlaces = this.getUserFavPlaces.bind(this);
    }

    async savePlace(req: CustomRequest, res: Response, next: NextFunction) {
        const {userId} = req.user as IOauth;
        const user = userId as IUser;

        const establishment = req.data_info as IEstablishment;
        const news = req.news as IEstablishmentNews;
        const {refPath, savedPlace} = req.body;
        try {
            let newSavedPlace: {_id?: string, item?: ObjectId, type?: string} = {};
            if (savedPlace?._id) {
                await this.userFavoritePlacesService.deleteOne({userId: user?._id, type: refPath, item: refPath === 'establishment' ? establishment?._id : news?._id});
            } else {
                const savPlace = await this.userFavoritePlacesService.create({
                    userId: user?._id,
                    type: refPath,
                    item: refPath === 'establishment' ? establishment?._id : news?._id
                });
                newSavedPlace = {
                    item: savPlace?.item,
                    type: savPlace?.type,
                    _id: savPlace?._id
                }
            }

            res.status(200).json({
                message: savedPlace?._id ? "Saved place deleted" : 'Saved successfully',
                newItem: newSavedPlace?._id ? newSavedPlace : {}
            })

        } catch (e) {
            next(e);
        }
    }
    async getUserFavPlaces(req: CustomRequest, res: Response, next: NextFunction) {
        const favPlaces = req.favPlaces;
        try {
            res.header('x-total-count', `${favPlaces?.count}`);
            res.header('Access-Control-Expose-Headers', 'x-total-count');

            res.status(200).json(favPlaces?.items);
        } catch (e) {
            next(e);
        }
    }
}

export default new SavedPlacesController();