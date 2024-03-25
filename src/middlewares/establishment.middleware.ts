import {NextFunction, Response} from "express";

import {EstablishmentService} from "../services";
import {CustomError} from "../errors";
import {CitySchema} from "../dataBase";
import {CustomRequest} from "../interfaces/func";
import {IEstablishment, IEstablishmentNews, IOauth, IUser} from "../interfaces/common";

class EstablishmentMiddleware {
    private establishmentService: EstablishmentService;

    constructor() {
        this.establishmentService = new EstablishmentService();

        this.checkEstablishment = this.checkEstablishment.bind(this);
        this.existCity = this.existCity.bind(this);
        this.getAllInfoById = this.getAllInfoById.bind(this);
        this.checkAverageCheckMinMax = this.checkAverageCheckMinMax.bind(this);
    }

    checkEstablishment = (type: "all_info" | "info" = 'info') => async (req: CustomRequest, _: Response, next: NextFunction) => {
        const news = req.news as IEstablishmentNews;
        try {
            const {placeId, establishmentId, refPath} = req.body;
            const {id} = req.params;

            if (refPath === 'establishmentNews') {
                next();
            } else {
                const currentId = placeId || establishmentId || id || "";

                if (news?.establishmentId && news?.establishmentId === placeId) {
                    next();
                }
                if (!currentId) {
                    return next(new CustomError('Establishment not found!', 404))
                }
                let establishment: IEstablishment;

                const query = await this.establishmentService.getOneEstablishment({_id: currentId}) as IEstablishment;
                if (type === 'all_info' && query) {
                    await query.populate([{
                        path: 'views',
                        select: 'viewsNumber _id'
                    }]);
                }
                establishment = query as IEstablishment;
                if (!establishment) {
                    return next(new CustomError("EstablishmentSchema not found", 404))
                }
                req.data_info = establishment;
                next();
            }
        } catch (e) {
            next(e)
        }
    }

    existCity = async (city: string) => async (_: CustomRequest, __: Response, next: NextFunction) => {
        try {
            const cityExist = await CitySchema.findOne({name: {$regex: new RegExp(city, "i")}});

            if (!cityExist) {
                await CitySchema.create({
                    name: city
                })
            }
            next()
        } catch (e) {
            next(e)
        }
    }

    async getAllInfoById(req: CustomRequest, _: Response, next: NextFunction) {
        const {userId} = req.user as IOauth;

        const user = userId as IUser;

        const establishment = req.data_info as IEstablishment;
        try {

            if (user?._id !== establishment?.createdBy && establishment?.verify !== "published" && user?.status !== 'admin') {
                return next(new CustomError("EstablishmentSchema not found", 404))
            }

            req.data_info = establishment;
            next();
        } catch (e) {
            next(e)
        }
    }
    async checkAverageCheckMinMax(req: CustomRequest, _: Response, next: NextFunction) {
        const status = req.newStatus;
        try {
            const result = await this.establishmentService.getAverageCheckMinMax(status);

            req.averageCheckMinMax = result;
            next();

        } catch (e) {
            next(e);
        }
    }
}

export default new EstablishmentMiddleware();