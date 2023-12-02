import {NextFunction, Response} from "express";

import {CustomRequest} from "../interfaces/func";
import {CitySchema, CityForCount} from "../dataBase";
import {ICityForCount} from "../interfaces/common";
import {CloudService} from "../services";

class CityController {

    private cloudService: CloudService;

    constructor() {
        this.cloudService = new CloudService();

        this.allCities = this.allCities.bind(this)
        this.allCountCities = this.allCountCities.bind(this)
        this.updateCityForCount = this.updateCityForCount.bind(this)
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

    async allCountCities(req: CustomRequest, res: Response, next: NextFunction) {
        try {
            const {city_like = ""} = req.query;

            const searchObject = {};
            if (city_like) {
                Object.assign(searchObject, {
                    $or: [
                        {name: {$regex: city_like, $options: 'i'}}
                    ]
                })
            }
            const cities = await CityForCount
                .find(searchObject)
                // .limit(50)
                // .sort({['name']: 'asc'})
                .exec();

            res.status(200).json(cities)

        } catch (e) {
            next(e)
        }
    }

    async updateCityForCount(req: CustomRequest, res: Response, next: NextFunction) {
        const city = req.cityForCount as ICityForCount;

        const {url, name_ua, name_en} = req.body;
        try {
            if (!req?.files?.url && url && url !== city?.url) {
                city.url = url;
            }
            if (req?.files?.url) {
                const {url: newUrl} = await this.cloudService.updateFile(city?.url, req?.files?.url, `city/${city?._id}`);
                city.url = newUrl
            }

            if (name_ua !== city?.name_ua) city.name_ua = name_ua;
            if (name_en !== city?.name_en) city.name_en = name_en;

            await city.save();

            res.status(200).json({city, message: 'City updated successfully'});

        } catch (e) {
            next(e);
        }
    }
}

export default new CityController();