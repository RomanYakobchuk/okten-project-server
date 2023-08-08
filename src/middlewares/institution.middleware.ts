import {NextFunction, Response} from "express";

import {InstitutionService} from "../services";
import {CustomError} from "../errors";
import {City} from "../dataBase";
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

    checkInstitution = (type: "all_info" | "info") => async (req: CustomRequest, res: Response, next: NextFunction) => {
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
                return next(new CustomError("Institution not found", 404))
            }

            req.data_info = institution;
            next();
        } catch (e) {
            next(e)
        }
    }

    existCity = async (city: string) => async (req: CustomRequest, res: Response, next: NextFunction) => {
        try {
            const cityExist = await City.findOne({name: {$regex: new RegExp(city, "i")}});

            if (!cityExist) {
                await City.create({
                    name: city
                })
            }
            next()
        } catch (e) {
            next(e)
        }
    }

    async getAllInfoById(req: CustomRequest, res: Response, next: NextFunction) {
        try {
            const {id} = req.params;
            const {userId} = req.user as IOauth;

            const user = userId as IUser;

            const institution = req.data_info as IInstitution;

            if (user?._id !== institution?.createdBy && institution?.verify !== "published" && user?.status !== 'admin') {
                return next(new CustomError("Institution not found", 404))
            }

            req.data_info = institution;
            next();
        } catch (e) {
            next(e)
        }
    }
}

export default new InstitutionMiddleware();