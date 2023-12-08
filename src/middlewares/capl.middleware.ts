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

    async isExist(req: CustomRequest, _: Response, next: NextFunction) {
        try {
            const {id} = req.params;

            const reservation = await this.caplService
                .findOneReserve({_id: id})
                .populate({path: 'institution', select: '_id createdBy title pictures type'});

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
        const reservation = req.reservation as ICapl;
        const {userId} = req.user as IOauth;
        const user = userId as IUser;
        const status = req.newStatus;
        const {newStatus, institutionStatus, userStatus} = req.body;

        try {
            const institution = reservation?.institution as IInstitution;

            if ((status !== 'admin') && (status !== 'manager' && institution?.createdBy?.toString() !== user?._id?.toString()) && reservation?.user?.toString() !== user?._id?.toString()) {
                return next(new CustomError('Access denied', 403))
            }

            if (type === 'update') {
                if (reservation?.userStatus?.value === 'accepted' && reservation?.institutionStatus?.value === 'accepted') {
                    if (newStatus !== 'rejected' && (status !== 'manager' && institutionStatus?.value !== 'rejected') && (status !== 'user' && userStatus?.value !== 'rejected') && status !== 'admin') {
                        if (!reservation?.isActive && status !== 'admin') {
                            return next(new CustomError('Reservation is inactive', 403))
                        }
                        return next(new CustomError("The place is already reserved", 405))
                    }
                }
                if (
                    (user?._id?.toString() !== reservation?.manager?.toString() &&
                        reservation.userStatus.value === 'accepted' &&
                        reservation.institutionStatus.value === 'accepted' &&
                        !reservation.isAllowedEdit) && status !== 'admin'
                ) {
                    return next(new CustomError('Редагування даних не дозволено', 403))
                }
            }
            next();

        } catch (e) {
            next(e)
        }
    }
}

export default new CaplMiddleware();