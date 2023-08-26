import {NextFunction, Response} from "express";

import {CaplService} from "../services";
import {CustomError} from "../errors";
import {CustomRequest} from "../interfaces/func";
import {ICapl, IInstitution, IOauth, IUser} from "../interfaces/common";

class CaplController {
    private caplService: CaplService;

    constructor() {
        this.caplService = new CaplService();

        this.findOneById = this.findOneById.bind(this)
        this.crateReservation = this.crateReservation.bind(this)
        this.findAllByUser = this.findAllByUser.bind(this)
        this.updateInfoByUser = this.updateInfoByUser.bind(this)
        this.updateInfoByInstitution = this.updateInfoByInstitution.bind(this)
    }

    async crateReservation(req: CustomRequest, res: Response, next: NextFunction) {
        try {
            const {userId} = req.user as IOauth;
            const user = userId as IUser;
            const institution = req.data_info as IInstitution;
            const {date, comment, writeMe, desiredAmount, numberPeople, whoPay, fullName, eventType} = req.body;

            await this.caplService.createReserve({
                institution: institution?._id as string,
                date: date as Date,
                writeMe: Boolean(writeMe),
                comment: comment as string,
                fullName: fullName as string,
                desiredAmount: desiredAmount as number,
                numberPeople: numberPeople as number,
                whoPay: whoPay as string,
                manager: institution?.createdBy as string,
                user: user?._id,
                eventType: eventType,
            });

            res.status(201).json({message: 'Reservation created, wait for confirmation'})
        } catch (e) {
            next(e)
        }
    }
    async findAllByUser(req: CustomRequest, res: Response, next: NextFunction) {
        const {userId} = req.user as IOauth;
        const user = userId as IUser;

        const {
            institution,
            day_gte,
            _end,
            _order,
            _start,
            _sort,
            search,
            userStatus,
            institutionStatus,
            active
        } = req.query;

        try {
            const {
                count,
                items
            } = await this.caplService.findByPagination(institution as string, day_gte, Number(_end), _order, Number(_start), _sort, search as string, userStatus as string, institutionStatus as string, user?._id as string, user?.status as string, Boolean(active));

            res.header('x-total-count', `${count}`);
            res.header('Access-Control-Expose-Headers', 'x-total-count');

            res.status(200).json(items)
        } catch (e) {
            next(e)
        }
    }

    findOneById = async (req: CustomRequest, res: Response, next: NextFunction) => {
        try {
            const {id} = req.params;
            const {userId} = req.user as IOauth;
            const user = userId as IUser;

            const reservation = await this.caplService
                .findOneReserve({_id: id})
                .populate({path: 'institution', select: '_id pictures title place createdBy type'});

            if (!reservation) {
                return next(new CustomError('Reservation not found', 404))
            }
            const institution = reservation.institution as IInstitution;

            if ((user?.status !== 'admin') && (user?.status !== 'manager' && (institution?.createdBy?.toString() !== user?._id?.toString() || reservation?.manager?.toString() !== user?._id?.toString())) && reservation?.user?.toString() !== user?._id?.toString()) {
                return next(new CustomError('Access denied', 403))
            }

            res.status(200).json(reservation);
        } catch (e) {
            next(e)
        }
    }

    updateInfoByUser = async (req: CustomRequest, res: Response, next: NextFunction) => {
        try {
            const reservation = req.reservation as ICapl;
            const {userId} = req.user as IOauth;
            const user = userId as IUser;
            // numberPeople, date, whoPay, desiredAmount, userStatus, institutionStatus, fullName, eventType, comment, writeMe
            const {...dataToUpdate} = req.body;

            for (const field in dataToUpdate) {
                if (dataToUpdate.hasOwnProperty(field)) {
                    let newValue = dataToUpdate[field];
                    const oldValue = reservation[field];

                    if (user?.status === 'user' || user?.status === 'admin') {
                        if (field !== 'userStatus' || 'institutionStatus' || 'numberPeople' || 'date' && newValue !== oldValue) {
                            reservation[field] = newValue;
                        }
                        if (field === 'date') {
                            const myDate = new Date(reservation?.date);
                            const currentDate = new Date(new Date().getTime() - (6 * 60 * 60 * 1000));
                            if (myDate > currentDate && reservation?.institutionStatus?.value !== 'accepted' || user?.status === 'admin') {
                                if (newValue) {
                                    reservation[field] = newValue;
                                }
                            } else {
                                return next(new CustomError("You can`t updated your reservation date", 405))
                            }
                        }
                        if (field === 'numberPeople' && reservation?.institutionStatus?.value !== 'accepted') {
                            reservation[field] = newValue
                        }
                        if (field === 'userStatus' && (reservation?.institutionStatus?.value !== 'accepted' || reservation?.institutionStatus?.freeDateFor?.length > 0)) {
                            reservation.userStatus = newValue?.value ? newValue : {value: newValue}
                        }
                    }
                    if (user?.status === 'manager' || user?.status === 'admin') {
                        if (field === 'institutionStatus') {
                            // if (newValue === '' && reservation?.userStatus?.value !== 'accepted')
                            reservation.institutionStatus = newValue?.value ? newValue : {value: newValue};
                        }
                    }
                }
            }

            await reservation.save();
            res.status(200).json({message: 'Some data updated success'});

        } catch (e) {
            next(e)
        }
    }
    updateInfoByInstitution = async (req: CustomRequest, res: Response, next: NextFunction) => {
        try {
            const reservation = req.reservation as ICapl;

            const {freeDateFor, institutionStatus, reasonRefusal, isReserved} = req.body;

            if (reservation?.userStatus?.value === "draft") {
                await this.caplService.updateOne({_id: reservation?._id}, {
                    institutionStatus: {
                        value: institutionStatus,
                        freeDateFor: institutionStatus === 'draft' ? [] : freeDateFor,
                        reasonRefusal: institutionStatus === 'draft' ? reasonRefusal : ''
                    },
                })
            } else if (reservation?.userStatus?.value === 'rejected') {
                await this.caplService.updateOne({_id: reservation?._id}, {
                    institutionStatus: {
                        value: isReserved ? 'accepted' : 'rejected'
                    },
                    isActive: !!isReserved
                })
            } else if (reservation?.userStatus?.value === 'accepted') {
                await this.caplService.updateOne({_id: reservation?._id}, {
                    institutionStatus: {
                        value: institutionStatus,
                        freeDateFor: institutionStatus === 'draft' ? freeDateFor : [],
                        reasonRefusal: institutionStatus === 'draft' ? reasonRefusal : ''
                    },
                })
            }

            res.status(200).json({message: 'Some data updated success'});

        } catch (e) {
            next(e)
        }
    }
}
export default new CaplController();
