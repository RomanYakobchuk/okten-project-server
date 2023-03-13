const {CustomError} = require('../errors');
const {constants} = require('../configs');
const {s3Service} = require("../services");


module.exports = {
    checkUserAvatar: async (req, res, next) => {
        try {

            const {id} = req.params;

            const {changeAva, currentId} = req.body;

            const {userId} = req.user;

            if (!userId?.isAdmin && id !== currentId) {
                return res.status(403).json({message: 'Access Denied'})
            }

            if (!req?.files?.avatar) {
                return next();
            }

            const {mimetype, size} = req.files.avatar;

            if (size > constants.IMAGE_MAX_SIZE) {
                return next(new CustomError('Max size 3MB'));
            }

            if (!constants.IMAGE_MIMETYPES.includes(mimetype)) {
                return next(new CustomError('Wrong file type'));
            }

            if (changeAva) {
                if (req?.files?.avatar) {
                    if (req.user.avatar) {
                        const {Location: fileUrl} = await s3Service.updateFile(req.files.avatar, req.user.avatar);
                        req.body.avatar = fileUrl;
                    } else {
                        const {Location: fileUrl} = await s3Service.uploadFile(req.files.avatar, 'user', id);
                        req.body.avatar = fileUrl;
                    }
                }
            }
            next();
        } catch (e) {
            next(e);
        }
    }
}