import {NextFunction, Response} from "express";

import {InstitutionService} from "../services";
import {CustomError} from "../errors";
import {CitySchema} from "../dataBase";
import {CustomRequest} from "../interfaces/func";
import {IInstitution, IOauth, IUser} from "../interfaces/common";

class InstitutionMiddleware {
    private institutionService: InstitutionService;

    constructor() {
        this.institutionService = new InstitutionService();

        this.checkInstitution = this.checkInstitution.bind(this);
        this.existCity = this.existCity.bind(this);
        this.getAllInfoById = this.getAllInfoById.bind(this);
    }

    checkInstitution = (type: "all_info" | "info" = 'info') => async (req: CustomRequest, _: Response, next: NextFunction) => {
        try {
            const {institutionId} = req.body;
            const {id} = req.params;

            let institution = {} as IInstitution, currentId: string = '';

            if (id) {
                currentId = id
            } else if (!id && institutionId) {
                currentId = institutionId
            }
            if (type === 'info') {
                institution = await this.institutionService.getOneInstitution({_id: currentId}) as IInstitution
            } else if (type === 'all_info') {
                institution = await this.institutionService.getOneInstitution({_id: currentId})
                    .populate("news")
                    .populate({
                        path: 'views',
                        select: 'viewsNumber _id'
                    }) as IInstitution;
            }

            if (!institution) {
                return next(new CustomError("InstitutionSchema not found", 404))
            }

            req.data_info = institution;
            next();
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

        const institution = req.data_info as IInstitution;
        try {

            if (user?._id !== institution?.createdBy && institution?.verify !== "published" && user?.status !== 'admin') {
                return next(new CustomError("InstitutionSchema not found", 404))
            }

            req.data_info = institution;
            next();
        } catch (e) {
            next(e)
        }
    }
}

export default new InstitutionMiddleware();