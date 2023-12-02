import {NextFunction, Response} from "express";

import {CustomRequest} from "../interfaces/func";
import {CustomError} from "../errors";
import {CityForCount} from "../dataBase";

class CityMiddleware {
    constructor() {
        this.checkCityForCount = this.checkCityForCount.bind(this);
    }

    async checkCityForCount(req: CustomRequest, res: Response, next: NextFunction) {
        const {id} = req.params
        const status = req.newStatus;

        try {

            if (status !== "admin") {
                return next(new CustomError('Access denied', 403))
            }
            const cityForCount = await CityForCount.findOne({_id: id});

            if (!cityForCount) {
                return next(new CustomError('City not found', 404));
            }
            req.cityForCount = cityForCount;
            next();

        } catch (e) {
            next(e);
        }
    }
}

export default new CityMiddleware();