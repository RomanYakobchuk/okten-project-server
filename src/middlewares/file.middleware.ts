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
            const {pictures: picturesBody} = req.body;

            if (((picturesBody?.length === 0 || !picturesBody) && !req.files?.pictures)) {
                return next(new CustomError("Photos is required", 400))
            }
            let newPhotos: any[] = [];
            if (picturesBody) {
                for (let otherPhotoBodyElement of picturesBody) {
                    newPhotos.push(otherPhotoBodyElement)
                }
            }
            const photosForDelete = property?.pictures?.filter(obj1 => !newPhotos.some(obj2 => obj1?.url === obj2?.url)) as IPicture[];

            for (let photosForDeleteElement of photosForDelete) {
                await this.cloudService.deleteFile(photosForDeleteElement?.url, `${propertyName}/${property?._id}/pictures`)
            }

            if (!req.files?.pictures || req.files?.pictures?.length === 0) {
                return next()
            }

            const newOtherPhoto: any[] = [];

            if (req.files?.pictures?.name) {
                const {url} = await this.cloudService.uploadFile(req.files?.pictures, `${propertyName}/${property?._id}/pictures`);
                newOtherPhoto?.push({name: req.files?.pictures?.name, url})
            } else {
                for (let item of req.files?.pictures) {
                    const {url} = await this.cloudService.uploadFile(item, `${propertyName}/${property?._id}/pictures`);
                    newOtherPhoto?.push({name: item?.name, url})
                }
            }
            if (picturesBody) {
                if (typeof picturesBody === 'string') {
                    req.body.pictures = [picturesBody, ...newOtherPhoto]
                } else {
                    req.body.pictures = [...picturesBody, ...newOtherPhoto];
                }

            } else {
                req.body.pictures = [...newOtherPhoto]
            }

            next()
        } catch (e) {
            next(e)
        }
    }
}

export default new FileMiddleware();