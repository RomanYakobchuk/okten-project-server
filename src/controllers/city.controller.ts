import {NextFunction, Response} from "express";

import {CustomRequest} from "../interfaces/func";
import {CitySchema} from "../dataBase";

class CityController {

    constructor() {
        this.allCities = this.allCities.bind(this)
    }

    async allCities(req: CustomRequest, res: Response, next: NextFunction) {
        try {
            const {city_like = ""} = req.query;

            const query: any = {};

            if (city_like !== "") {
                query.name = city_like
            }

            const searchObject = {};
            Object.assign(searchObject, {
                $or: [
                    {name: {$regex: city_like, $options: 'i'}}
                ]
            })

            const cities = await CitySchema
                .find(searchObject)
                .limit(50)
                .sort({['name']: 'asc'})
                .exec();

            res.status(200).json(cities ?? [])

        } catch (e) {
            next(e)
        }
    }
}

export default new CityController();