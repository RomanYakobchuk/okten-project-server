const {CustomError} = require('../errors');
const {constants} = require('../configs');
const { cloudService} = require("../services");


module.exports = {
    checkUserAvatar: async (req, res, next) => {
        try {

            const {id} = req.params;

            const {changeAva, currentId} = req.body;

            const {userId} = req.user;

            if (!userId?.status !== 'admin' && id !== currentId) {
                return res.status(403).json({message: 'Access Denied'})
            }

            if (!req?.files) {
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
                    if (userId?.avatar) {
                        const {url} = await cloudService.updateFile(userId?.avatar, req.files.avatar?.tempFilePath, `user/${userId?._id}`)
                        req.body.avatar = url;
                    } else {
                        const {url} = await cloudService.uploadFile(req.files.avatar?.tempFilePath, `user/${userId?._id}`);
                        req.body.avatar = url;
                    }
                }
            }
            next();
        } catch (e) {
            next(e);
        }
    },
    checkImagesForUpdated: (propertyName) => async (req, res, next) => {
        try {
            const property = req.data_info;
            const {otherPhoto: otherPhotoBody} = req.body;
            if (((otherPhotoBody?.length === 0 || !otherPhotoBody) && !req.files?.otherPhoto) || (!req.body.mainPhoto && !req.files?.mainPhoto)) {
                return next(new CustomError("Photos is required", 400))
            }
            let newPhotos = [];
            if (otherPhotoBody) {
                if (typeof otherPhotoBody === 'string') {
                    newPhotos?.push(JSON.parse(otherPhotoBody));
                } else {
                    for (let otherPhotoBodyElement of otherPhotoBody) {
                        otherPhotoBodyElement = JSON.parse(otherPhotoBodyElement);
                        newPhotos.push(otherPhotoBodyElement)
                    }
                }
            }
            const photosForDelete = property?.otherPhoto?.filter(obj1 => !newPhotos.some(obj2 => obj1?.url === obj2?.url));

            for (let photosForDeleteElement of photosForDelete) {
                if (typeof photosForDeleteElement === "string") {
                    photosForDeleteElement = JSON.parse(photosForDeleteElement);
                }
                await cloudService.deleteFile(photosForDeleteElement?.url, `${propertyName}/${property?._id}/otherPhoto`)
            }

            if (!req.files?.mainPhoto && (!req.files?.otherPhoto || req.files?.otherPhoto?.length === 0)) {
                return next()
            }

            const newOtherPhoto = [];

            if (req.files?.otherPhoto) {
                if (req.files?.otherPhoto?.name) {
                    const {url} = await cloudService.uploadFile(req.files?.otherPhoto?.tempFilePath, `${propertyName}/${property?._id}/otherPhoto`);
                    newOtherPhoto?.push({name: req.files?.otherPhoto?.name, url})
                } else {
                    for (let item of req.files?.otherPhoto) {
                        const {url} = await cloudService.uploadFile(item?.tempFilePath, `${propertyName}/${property?._id}/otherPhoto`);
                        newOtherPhoto?.push({name: item?.name, url})
                    }
                }
                if (otherPhotoBody) {
                    if (typeof otherPhotoBody === 'string') {
                        req.body.otherPhoto = [otherPhotoBody, ...newOtherPhoto]
                    } else {
                        req.body.otherPhoto = [...otherPhotoBody, ...newOtherPhoto];
                    }

                } else {
                    req.body.otherPhoto = [...newOtherPhoto]
                }
            }
            if (req.files?.mainPhoto) {
                const {url: mainUrl} = await cloudService.updateFile(property?.mainPhoto, req.files?.mainPhoto?.tempFilePath, `${propertyName}/${property?._id}/mainPhoto`);
                req.body.mainPhoto = mainUrl;
            }
            next()
        } catch (e) {
            next(e)
        }
    }
}