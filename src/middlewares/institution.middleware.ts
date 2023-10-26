import {NextFunction, Response} from "express";

import {InstitutionService} from "../services";
import {CustomError} from "../errors";
import {CitySchema} from "../dataBase";
import {CustomRequest} from "../interfaces/func";
import {IInstitution, IInstitutionNews, IOauth, IUser} from "../interfaces/common";

class InstitutionMiddleware {
    private institutionService: InstitutionService;

    constructor() {
        this.institutionService = new InstitutionService();

        this.checkInstitution = this.checkInstitution.bind(this);
        this.existCity = this.existCity.bind(this);
        this.getAllInfoById = this.getAllInfoById.bind(this);
    }

    checkInstitution = (type: "all_info" | "info" = 'info') => async (req: CustomRequest, _: Response, next: NextFunction) => {
        const news = req.news as IInstitutionNews;
        try {
            const {institutionId, refPath} = req.body;
            const {id} = req.params;

            if (refPath === 'institutionNews') {
                next();
            } else {
                const currentId = institutionId || id || "";

                if (news?.institutionId && news?.institutionId === institutionId) {
                    next();
                }
                let institution: IInstitution;

                const query = await this.institutionService.getOneInstitution({_id: currentId}) as IInstitution;
                if (type === 'all_info' && query) {
                    await query.populate([{
                        path: 'views',
                        select: 'viewsNumber _id'
                    }]);
                }
                institution = query as IInstitution;
                if (!institution) {
                    return next(new CustomError("InstitutionSchema not found", 404))
                }
                req.data_info = institution;

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