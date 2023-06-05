const {caplService} = require("../services");
const {CustomError} = require("../errors");
module.exports = {
    isExist: async (req, res, next) => {
        try {
            const {id} = req.params;

            const reservation = await caplService
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
    },

    checkAccess: (type) => async (req, res, next) => {
        try {
             const reservation = req.reservation;
             const {userId: user} = req.user;

            if ((user?.status !== 'admin') && (user?.status !== 'manager' && reservation.institution.createdBy !== user?._id) && reservation?.user !== user?._id && !reservation?.isActive) {
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