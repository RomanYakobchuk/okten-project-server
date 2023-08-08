import {NextFunction, Response} from "express";

import {CaplService} from "../services";
import {CustomError} from "../errors";
import {CustomRequest} from "../interfaces/func";
import {ICapl, IInstitution, IOauth, IUser} from "../interfaces/common";

class CaplMiddleware {
    private caplService: CaplService;

    constructor() {
        this.caplService = new CaplService();

        this.isExist = this.isExist.bind(this);
        this.checkAccess = this.checkAccess.bind(this);
    }
    async isExist(req: CustomRequest, res: Response, next: NextFunction) {
        try {
            const {id} = req.params;

            const reservation = await this.caplService
                .findOneReserve({_id: id})
                .populate({path: 'institution', select: '_id createdBy title mainPhoto'});

            if (!reservation) {
                return next(new CustomError("Reservation not found", 404));
            }
            req.reservation = reservation;
            next()
        } catch (e) {
            next(e)
        }
    }

    checkAccess = (type: string) => async (req: CustomRequest, res: Response, next: NextFunction) => {
        try {
             const reservation = req.reservation as ICapl;
             const {userId} = req.user as IOauth;
             const user = userId as IUser;

             const institution = reservation.institution as IInstitution;

            if ((user?.status !== 'admin') && (user?.status !== 'manager' && institution.createdBy !== user?._id) && reservation?.user !== user?._id && !reservation?.isActive) {
                return next(new CustomError('Access denied', 403))
            }

            if (type === 'update') {
                if (reservation?.userStatus?.value === 'accepted' && reservation?.institutionStatus?.value === 'accepted') {
                    return next(new CustomError("The place is already reserved", 405))
                }
            }
            req.reservation = reservation;
            next();

        } catch (e) {
            next(e)
        }
    }
}

export default new CaplMiddleware();