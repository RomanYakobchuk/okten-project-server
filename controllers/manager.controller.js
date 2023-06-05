const {CustomError} = require("../errors");
const {userService, managerService} = require("../services");

module.exports = {
    managers: async (req, res, next) => {
        try {
            const {userId: user} = req.user;

            if (user?.status !== 'admin') {
                return next(new CustomError("Access denied", 403))
            }

            const {manager_like = ''} = req.query;

            const searchObject = {};
            if (manager_like !== "") {

                Object.assign(searchObject, {
                    $or: [
                        {name: {$regex: manager_like, $options: 'i'}},
                        {email: {$regex: manager_like, $options: 'i'}},
                        {phone: {$regex: manager_like, $options: 'i'}},
                    ],
                    'verify.isVerify': false
                })
            }
            const managers = await managerService
                .findManagers(searchObject)
                .populate('user', 'avatar status dOB _id name email phone')
                .select('_id user')
                .limit(20)
                .sort({['name']: 'asc'})
                .exec();

            res.status(200).json(managers ?? [])
        } catch (e) {
            next(e)
        }
    },
    oneManager: async (req, res, next) => {
        try {
            const {id} = req.params;

            const manager = await managerService.findOneManager({
                user: id
            }).populate('user');

            if (!manager) {
                return next(new CustomError('User not found', 404))
            }
            res.status(200).json(manager)
        } catch (e) {
            next(e)
        }
    }
}