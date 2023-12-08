import {NextFunction, Response} from "express";
import {Schema} from "mongoose";

import {CaplService, NotificationService} from "../services";
import {CustomError} from "../errors";
import {CustomRequest} from "../interfaces/func";
import {ICapl, IInstitution, INotification, IOauth, IUser} from "../interfaces/common";

class CaplController {
    private caplService: CaplService;
    private notificationService: NotificationService;

    constructor() {
        this.caplService = new CaplService();
        this.notificationService = new NotificationService();

        this.findOneById = this.findOneById.bind(this)
        this.crateReservation = this.crateReservation.bind(this)
        this.findAllByUser = this.findAllByUser.bind(this)
        this.updateInfoByUser = this.updateInfoByUser.bind(this)
        this.updateInfoByInstitution = this.updateInfoByInstitution.bind(this)
        this.updateStatus = this.updateStatus.bind(this)
    }

    async crateReservation(req: CustomRequest, res: Response, next: NextFunction) {
        // const {userId: currentUserID} = req.user as IOauth;
        // const user = currentUserID as IUser;
        const institution = req.data_info as IInstitution;
        const {
            date,
            comment,
            writeMe,
            desiredAmount,
            numberPeople,
            whoPay,
            fullName,
            eventType,
            userId,
            managerId,
            userStatus,
            institutionStatus,
            isAllowedEdit
        } = req.body;
        try {
            const reservation = await this.caplService.createReserve({
                institution: institution?._id as string,
                date: date as Date,
                seats: {
                    numberOfSeats: 0,
                    status: "reserved",
                    table: 1
                },
                userStatus,
                institutionStatus,
                writeMe: Boolean(writeMe),
                comment: comment as string,
                fullName: fullName as string,
                desiredAmount: desiredAmount as number,
                numberPeople: numberPeople as number,
                whoPay: whoPay as string,
                manager: managerId,
                user: userId,
                isAllowedEdit,
                eventType: eventType,
            });
            let notification: INotification | null = null;
            if (reservation?.userStatus?.value === 'accepted') {
                notification = await this.notificationService.create({
                    type: "newReservation",
                    userId: userId as Schema.Types.ObjectId,
                    isRead: false,
                    message: 'User reserved seats',
                    description: reservation?._id,
                    forUser: {
                        role: 'manager',
                        userId: institution?.createdBy
                    },
                    status: 'usual'
                });
            }

            res.status(201).json({
                message: 'Reservation created, wait for confirmation',
                reservation,
                notification: notification
            });

            // await axios.post(`${configs.SOCKET_URL}/socket.io/api/v1/notification/create`, {
            //     userId: reservation?.manager,
            //     reservation
            // });
            // return;
        } catch (e) {
            next(e)
        }
    }

    async findAllByUser(req: CustomRequest, res: Response, next: NextFunction) {
        const {userId} = req.user as IOauth;
        const user = userId as IUser;
        const status = req.newStatus;

        const {
            institution,
            day_gte,
            _end,
            _order,
            _start,
            _sort,
            search_like,
            userStatus,
            institutionStatus,
            active,
        } = req.query;

        try {
            const {
                count,
                items
            } = await this.caplService.findByPagination(institution as string, day_gte, Number(_end), _order, Number(_start), _sort, search_like as string, userStatus as string, institutionStatus as string, user?._id as string, status as string, active as "" | "true" | "false");
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
            const myDate = new Date(reservation?.date);
            const currentDate = new Date();
            if (((reservation?.userStatus?.value === 'accepted' && myDate < currentDate) || (reservation?.userStatus?.value === 'rejected' && reservation?.institutionStatus?.reasonRefusal)) && reservation?.institutionStatus?.value === 'rejected') {
                reservation.isActive = false;
                await reservation.save();
            }

            res.status(200).json(reservation);
        } catch (e) {
            next(e)
        }
    }

    updateInfoByUser = async (req: CustomRequest, res: Response, next: NextFunction) => {
        const reservation = req.reservation as ICapl;
        const {userId} = req.user as IOauth;
        const user = userId as IUser;
        const status = req.newStatus;
        // numberPeople, date, whoPay, desiredAmount, userStatus, institutionStatus, fullName, eventType, comment, writeMe
        const {...dataToUpdate} = req.body;
        try {

            for (const field in dataToUpdate) {
                if (dataToUpdate.hasOwnProperty(field)) {
                    let newValue = dataToUpdate[field];
                    const oldValue = reservation[field];

                    if (reservation?.user?.toString() === user?._id?.toString() || reservation?.manager?.toString() === user?._id?.toString() || status === 'admin') {
                        if ((field !== ('userStatus' || 'institutionStatus' || 'date' || 'isAllowedEdit')) && newValue !== oldValue) {
                            reservation[field] = newValue;
                        }
                        if ((field === 'isAllowedEdit' && user?._id?.toString() === reservation?.manager?.toString()) || status === 'admin') {
                            reservation[field] = newValue
                        }
                        if (field === 'date') {
                            const myDate = new Date(reservation?.date);
                            const currentDate = new Date(new Date().getTime() - (1 * 60 * 60 * 1000));
                            if (myDate > currentDate && reservation?.institutionStatus?.value !== 'accepted' || user?.status === 'admin' || reservation?.isAllowedEdit) {
                                if (newValue) {
                                    reservation[field] = newValue;
                                }
                            } else {
                                return next(new CustomError("You can`t updated your reservation date", 405))
                            }
                        }
                    }
                    if ((field === 'userStatus' && user?._id?.toString() === reservation?.user?.toString()) || status === 'admin') {
                        reservation[field] = newValue
                    }
                    if ((field === 'institutionStatus' && user?._id?.toString() === reservation?.manager?.toString()) || status === 'admin') {
                        reservation[field] = newValue
                    }
                }
            }

            await reservation.save();
            res.status(200).json({message: 'Some data updated success', reservation});

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

    updateStatus = async (req: CustomRequest, res: Response, next: NextFunction) => {
        const {type, newStatus} = req.body;
        const ANewType = ['institutionStatus', "userStatus"];

        try {
            const reservation = req.reservation as ICapl;

            if (ANewType.includes(type) && newStatus && reservation[type]?.value !== newStatus) {
                reservation[type].value = newStatus;
            }
            await reservation?.save();

            // const newReserve = await this.caplService.updateOne({_id: reservation?._id}, {
            //     [type]: {
            //         ...reservation[type],
            //         value: newStatus
            //     }
            // })

            res.status(200).json({message: 'Status updated successfully', reservation})

        } catch (e) {
            next(e);
        }
    }
}

export default new CaplController();
