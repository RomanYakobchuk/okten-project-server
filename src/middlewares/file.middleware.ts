import {CustomError} from '../errors';
import {constants} from '../configs';
import {CloudService} from "../services";
import {CustomRequest} from "../interfaces/func";
import {NextFunction, Response} from "express";
import {IOauth, IPicture, IUser} from "../interfaces/common";


class FileMiddleware {
    private cloudService: CloudService;

    constructor() {
        this.cloudService = new CloudService();

        this.checkUserAvatar = this.checkUserAvatar.bind(this);
        this.checkImagesForUpdated = this.checkImagesForUpdated.bind(this);
    }

    async checkUserAvatar(req: CustomRequest, res: Response, next: NextFunction) {
        try {
            const {id} = req.params;

            const {changeAva, currentId} = req.body;

            const {userId} = req.user as IOauth;
            const user = userId as IUser;

            if (user?.status !== 'admin' && id !== currentId) {
                return res.status(403).json({message: 'Access Denied'})
            }

            if (!req?.files) {
                return next();
            }

            const {mimetype, size} = req.files.avatar as any;

            if (size > constants.IMAGE_MAX_SIZE) {
                return next(new CustomError('Max size 3MB'));
            }

            if (!constants.IMAGE_MIMETYPES.includes(mimetype)) {
                return next(new CustomError('Wrong file type'));
            }
            if (changeAva) {
                if (req?.files?.avatar) {
                    if (user?.avatar) {
                        const {url} = await this.cloudService.updateFile(user?.avatar, req.files.avatar.tempFilePath as any, `user/${user?._id}`)
                        req.body.avatar = url;
                    } else {
                        const {url} = await this.cloudService.uploadFile(req.files.avatar?.tempFilePath as any, `user/${user?._id}`);
                        req.body.avatar = url;
                    }
                }
            }
            next();
        } catch (e) {
            next(e);
        }
    }
    checkImagesForUpdated = (propertyName: string) => async (req: CustomRequest, res: Response, next: NextFunction) => {
        try {
            const property = req.data_info;
            const {otherPhoto: otherPhotoBody} = req.body;
            if (((otherPhotoBody?.length === 0 || !otherPhotoBody) && !req.files?.otherPhoto) || (!req.body.mainPhoto && !req.files?.mainPhoto)) {
                return next(new CustomError("Photos is required", 400))
            }
            let newPhotos: any[] = [];
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
            const photosForDelete = property?.pictures?.filter(obj1 => !newPhotos.some(obj2 => obj1?.url === obj2?.url)) as IPicture[];

            for (let photosForDeleteElement of photosForDelete) {
                if (typeof photosForDeleteElement === "string") {
                    photosForDeleteElement = JSON.parse(photosForDeleteElement);
                }
                await this.cloudService.deleteFile(photosForDeleteElement?.url, `${propertyName}/${property?._id}/otherPhoto`)
            }

            if (!req.files?.mainPhoto && (!req.files?.otherPhoto || req.files?.otherPhoto?.length === 0)) {
                return next()
            }

            const newOtherPhoto: any[] = [];

            if (req.files?.otherPhoto) {
                if (req.files?.otherPhoto?.name) {
                    const {url} = await this.cloudService.uploadFile(req.files?.otherPhoto?.tempFilePath, `${propertyName}/${property?._id}/otherPhoto`);
                    newOtherPhoto?.push({name: req.files?.otherPhoto?.name, url})
                } else {
                    for (let item of req.files?.otherPhoto) {
                        const {url} = await this.cloudService.uploadFile(item?.tempFilePath, `${propertyName}/${property?._id}/otherPhoto`);
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
                // const {url: mainUrl} = await cloudService.updateFile(property?.mainPhoto, req.files?.mainPhoto?.tempFilePath, `${propertyName}/${property?._id}/mainPhoto`);
                // req.body.mainPhoto = mainUrl;
            }
            next()
        } catch (e) {
            next(e)
        }
    }
}

export default new FileMiddleware();