const { CustomError } = require('../errors');
const { userService } = require('../services');

module.exports = {
    isUserPresent: async (req, res, next) => {
        try {
            const { id } = req.params;
            const { userId } = req.body;

            let currentId;

            if (id) {
                currentId = id
            } else if (!id && userId) {
                currentId = userId
            }
            const user = await userService.findOneUser({ _id: currentId });
            if (!user) {
                return next(new CustomError('User not found'));
            }

            req.userExist = user;
            next();
        } catch (e) {
            console.log(`isUserPresent user.middleware`)
            next(e);
        }
    },

    isUserUniq: async (req, res, next) => {
        try {
            const { email } = req.body;

            const user = await userService.findOneUser({ email });
            if (user) {
                return next(new CustomError(`User with email [ ${email} ] is exist`, 409));
            }
            req.user = user;
            next();
        } catch (e) {
            next(e);
        }
    },
};