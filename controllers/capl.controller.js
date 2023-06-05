const {caplService, userService} = require("../services");
const {CustomError} = require("../errors");

module.exports = {

    crateReservation: async (req, res, next) => {
        try {
            const {userId: user} = req.user;
            const institution = req.data_info;
            const {date, comment, writeMe, desiredAmount, numberPeople, whoPay, fullName, eventType} = req.body;

            await caplService.createReserve({
                institution: institution?._id,
                date: date,
                writeMe: writeMe,
                comment: comment,
                fullName: fullName,
                desiredAmount: desiredAmount,
                numberPeople: numberPeople,
                whoPay: whoPay,
                manager: institution?.createdBy,
                user: user?._id,
                eventType: eventType
            });

            res.status(201).json({message: 'Reservation created, wait for confirmation'})
        } catch (e) {
            next(e)
        }
    },


    findAllByUser: async (req, res, next) => {
        const {userId: user} = req.user;

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

        const query = {};

        if (userStatus !== '') query.userStatus = userStatus;
        if (institution !== '') query.institution = institution;
        if (day_gte !== undefined || null) query.date = day_gte;
        if (active !== '') query.isActive = active;
        if (search !== '') query.search_like = search;
        try {
            const {
                count,
                items
            } = await caplService.findByPagination(institution, day_gte, _end, _order, _start, _sort, search, userStatus, institutionStatus, user?._id, user?.status, query, active);

            res.header('x-total-count', count);
            res.header('Access-Control-Expose-Headers', 'x-total-count');

            res.status(200).json(items)
        } catch (e) {
            next(e)
        }
    },

    findOneById: async (req, res, next) => {
        try {
            const {id} = req.params;
            const {userId: user} = req.user

            const reservation = await caplService
                .findOneReserve({_id: id})
                .populate({path: 'institution', select: '_id mainPhoto title place createdBy type'});

            if (!reservation) {
                return next(new CustomError('Reservation not found', 404))
            }

            if ((user?.status !== 'admin') && (user?.status !== 'manager' && (reservation.institution.createdBy?.toString() !== user?._id?.toString() || reservation?.manager?.toString() !== user?._id?.toString())) && reservation?.user?.toString() !== user?._id?.toString()) {
                return next(new CustomError('Access denied', 403))
            }

            res.status(200).json(reservation);
        } catch (e) {
            next(e)
        }
    },

    updateInfoByUser: async (req, res, next) => {
        try {
            const reservation = req.reservation;
            const {userId: user} = req.user;
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
                        if (field === 'userStatus' && (reservation?.institutionStatus?.status !== 'accepted' || reservation?.institutionStatus?.freeDateFor?.length > 0)) {
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
    },
    updateInfoByInstitution: async (req, res, next) => {
        try {
            const reservation = req.reservation;

            const {freeDateFor, institutionStatus, reasonRefusal} = req.body;

            if (reservation?.userStatus?.value === 'draft') {
                await caplService.updateOne({_id: reservation?._id}, {
                    institutionStatus: {
                        value: institutionStatus,
                        freeDateFor: institutionStatus === 'draft' ? [] : freeDateFor,
                        reasonRefusal: institutionStatus === 'draft' ? reasonRefusal : ''
                    },
                })
            } else if (reservation?.userStatus?.value === 'rejected') {
                await caplService.updateOne({_id: reservation?._id}, {
                    institutionStatus: {
                        value: isReserved ? 'accepted' : 'rejected'
                    },
                    isActive: !!isReserved
                })
            } else if (reservation?.userStatus?.value === 'accepted') {
                await caplService.updateOne({_id: reservation?._id}, {
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