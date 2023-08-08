import {Document} from "mongoose";
import {NextFunction, Response} from "express";

import {CustomRequest} from "../interfaces/func";
import {Institution, Views, Menu} from "../dataBase";
import {
    UserService, InstitutionService, CloudService, TokenService
} from '../services';
import {CustomError} from "../errors";
import {userPresenter} from "../presenters/user.presenter";
import {institutionMiddleware} from "../middlewares";
import {IInstitution, IOauth, IUser} from "../interfaces/common";


class InstitutionController {

    private userService: UserService;
    private cloudService: CloudService;
    private institutionService: InstitutionService;
    private tokenService: TokenService;

    constructor() {
        this.cloudService = new CloudService();
        this.userService = new UserService();
        this.institutionService = new InstitutionService();
        this.tokenService = new TokenService();

        this.similarEstablishment = this.similarEstablishment.bind(this);
        this.allInstitutionByVerify = this.allInstitutionByVerify.bind(this);
        this.createInstitution = this.createInstitution.bind(this);
        this.updateInstitutionById = this.updateInstitutionById.bind(this);
        this.getById = this.getById.bind(this);
        this.deleteInstitutions = this.deleteInstitutions.bind(this);
        this.countByType = this.countByType.bind(this);
        this.countByCity = this.countByCity.bind(this);
        this.countMoreViews = this.countMoreViews.bind(this);
        this.uniquePlaces = this.uniquePlaces.bind(this);
        this.userInstitutionsByQuery = this.userInstitutionsByQuery.bind(this);
        this.updateStatus = this.updateStatus.bind(this);
        this.getStatus = this.getStatus.bind(this);
        this.allByUserId = this.allByUserId.bind(this);
        this.establishmentNearby = this.establishmentNearby.bind(this);
    }

    async allInstitutionByVerify(req: CustomRequest, res: Response, next: NextFunction) {
        const {
            _end,
            _order,
            _start,
            _sort,
            title_like = "",
            propertyType = "",
            tag_like,
            averageCheck_lte,
            averageCheck_gte,
            city_like = "",
            verify = ''
        } = req.query;

        const userStatus = req.newStatus;


        let placeStatus: string;
        if (userStatus === 'admin') {
            placeStatus = verify as string;
        } else {
            placeStatus = 'published'
        }
        try {
            const {
                count,
                items
            } = await this.institutionService.getWithPagination(Institution, Number(_end), _order, Number(_start), _sort, title_like as string, propertyType as string, tag_like as string, placeStatus as string, Number(averageCheck_gte), Number(averageCheck_lte), city_like as string, userStatus as string);

            res.header('x-total-count', `${count}`);
            res.header('Access-Control-Expose-Headers', 'x-total-count');

            res.status(200).json(items)
        } catch (e) {
            next(e)
        }
    }

    async createInstitution(req: CustomRequest, res: Response, next: NextFunction) {
        try {
            const {
                title,
                workSchedule,
                location,
                place,
                type,
                description,
                contacts,
                tags,
                averageCheck,
                features,
                verify,
                createdBy
            } = req.body;

            const {pictures} = req.files;

            const {userId} = req.user as IOauth;
            const user = userId as IUser;

            let currentUser: any;
            if (createdBy?.length > 0) {
                currentUser = await this.userService.findOneUser({_id: createdBy})
                if (!currentUser) {
                    return next(new CustomError('User not found'));
                }
            }

            const newVerify = user?.status === 'admin' ? verify : 'draft';

            const institution = await this.institutionService.createInstitution({
                title,
                workSchedule: JSON.parse(workSchedule),
                location: JSON.parse(location),
                place: JSON.parse(place),
                type,
                createdBy: currentUser?._id === user?._id ? user?._id : currentUser?._id,
                description,
                contacts: JSON.parse(contacts),
                tags: JSON.parse(tags),
                verify: newVerify,
                pictures: [],
                averageCheck,
                features: JSON.parse(features),
            });

            if (pictures) {
                let currentPictures: any[] = [];
                if (pictures?.name) {
                    currentPictures.push(pictures);
                } else {
                    currentPictures = pictures;
                }
                const uploadedPictures = await this.cloudService.uploadPictures(`institution/${institution?._id}/otherPhoto`, currentPictures);
                for (const uploadedPicture of uploadedPictures) {
                    institution?.pictures?.push({name: uploadedPicture?.name, url: uploadedPicture.url})
                }
            }

            const viewsDB = await Views.create({
                refField: 'institution',
                viewsWith: institution?._id
            });

            institution.views = viewsDB?._id;

            await institution.save();

            await institutionMiddleware.existCity(JSON.parse(place)?.city);

            await Menu.create({
                institutionId: institution?._id,
                createdBy: currentUser?._id === user?._id ? user?._id : currentUser?._id,
            })

            if (currentUser?._id === user?._id) {
                const userForResponse = userPresenter(user);

                const {token} = await this.tokenService.tokenWithData(userForResponse, "12h");

                res.status(201).json({user: token, createdById: user?._id});
            } else {
                res.status(201).json({message: "Institution created successful"})
            }
        } catch (e) {
            console.log('Error created institution')
            next(e)
        }
    }

    async updateInstitutionById(req: CustomRequest, res: Response, next: NextFunction) {
        try {
            const {...dataToUpdate} = req.body;
            const institution = req.data_info as IInstitution;
            for (const field in dataToUpdate) {
                if (dataToUpdate.hasOwnProperty(field)) {
                    let newValue = dataToUpdate[field];
                    const oldValue = institution[field];
                    if (typeof newValue === 'string' && field !== 'mainPhoto') {
                        newValue = JSON.parse(newValue);
                    }
                    if (field !== 'pictures' && newValue !== oldValue) {
                        institution[field] = newValue;
                    }
                }
            }
            institution?.pictures?.splice(0, institution?.pictures?.length);
            if (typeof req.body.pictures === 'string') {
                const newPhoto = JSON.parse(req.body.pictures);
                institution?.pictures?.push(newPhoto);
            } else {
                for (let element of req.body.pictures) {
                    if (typeof element === 'string') {
                        element = JSON.parse(element)
                    }
                    institution?.pictures?.push(element)
                }
            }

            await institution?.save();
            res.status(200).json({message: 'Institution updated successfully'});
        } catch (e) {
            next(e)
        }
    }

    async getById(req: CustomRequest, res: Response, next: NextFunction) {
        try {
            const institution = req.data_info as IInstitution;

            res.status(200).json(institution);
        } catch (e) {
            next(e)
        }
    }

    async deleteInstitutions(req: CustomRequest, res: Response, next: NextFunction) {
        try {
            // const {userId: user} = req.user;
            // const institution = req.data_info;
            // const status = req.newStatus;
            //
            // if (status !== 'admin' && user?._id?.toString() !== institution?.createdBy?.toString()) {
            //     return next(new CustomError('Access denied', 403));
            // }
            //
            // await cloudService.deleteFile(institution?.mainPhoto, `institution/${institution?._id}/mainPhoto`);
            //
            // for (const institutionElement of institution?.otherPhoto) {
            //     await cloudService.deleteFile(institutionElement?.url, `institution/${institution?._id}/otherPhoto`)
            // }
            // user?.allInstitutions?.filter((value) => value !== institution?._id);
            //
            // await institutionService.deleteOne({_id: institution?._id});
            //
            // await user.save();

            res.status(200).json({message: 'Deleted successfully'})

        } catch (e) {
            next(e)
        }
    }

    async countByCity(req: CustomRequest, res: Response, next: NextFunction) {
        const queryCities: string = req.query?.cities as string;

        const cities = queryCities?.split(',');
        try {
            const list = await Promise.all(
                cities?.map((city: string) => {
                    return Institution.countDocuments({
                        $and: [
                            {"place.city": {$regex: city, $options: 'i'}},
                            {verify: 'published'},
                        ]
                    })
                })
            )
            res.status(200).json(list)
        } catch (e) {
            next(e)
        }
    }

    async countByType(req: CustomRequest, res: Response, next: NextFunction) {
        try {
            const cafeCount = await Institution.countDocuments({type: 'cafe', verify: 'published'})
            const barCount = await Institution.countDocuments({type: 'bar', verify: 'published'})
            const restaurantCount = await Institution.countDocuments({type: 'restaurant', verify: 'published'})

            res.status(200).json([
                {type: 'cafe', count: cafeCount},
                {type: 'bar', count: barCount},
                {type: 'restaurant', count: restaurantCount},
            ])
        } catch (e) {
            next(e)
        }
    }

    async countMoreViews(req: CustomRequest, res: Response, next: NextFunction) {
        try {
            const components = await Views.getTopComponents(5);

            const promises = components.map((component: Document) => {
                return component.populate({path: 'viewsWith', select: '_id mainPhoto title type place'});
            });

            const data = await Promise.all(promises);
            res.status(200).json(data)
        } catch (e) {
            next(e);
        }
    }

    async uniquePlaces(req: CustomRequest, res: Response, next: NextFunction) {
        const {keyword} = req.query;

        const regex = new RegExp(keyword as string, 'i');

        try {
            const cities = await Institution?.aggregate([
                {$match: {"place.city": regex}},
                {$group: {_id: "$place.city"}},
                {$limit: 20}
            ])
            res.status(200).json(cities);
        } catch (err) {
            next(err)
        }
    }

    async userInstitutionsByQuery(req: CustomRequest, res: Response, next: NextFunction) {
        try {
            const {title_like = ""} = req.query;
            const {userId} = req.user as IOauth;
            const user = userId as IUser;
            const userStatus = req.newStatus;

            const query: any = {};

            if (title_like !== "") {
                query.title = title_like
            }
            const createdBy = userStatus === 'admin' ? 'all' : userStatus === 'manager' ? user?._id : false;
            if (createdBy === false) {
                return next(new CustomError("Access denied", 403));
            }

            const {items} = await this.institutionService.getUserInstitutionsByQuery(title_like as string, createdBy);

            res.status(200).json(items);

        } catch (e) {
            next(e)
        }
    }

    async updateStatus(req: CustomRequest, res: Response, next: NextFunction) {
        try {
            const institution = req.data_info as IInstitution;
            const userStatus = req.newStatus;
            const {status: newStatus} = req.body;

            if (userStatus !== 'admin') {
                return next(new CustomError('Access denied', 403));
            }

            institution.verify = newStatus;

            await institution.save();

            const view = await Views.findOne({viewsWith: institution?._id, refField: 'institution'});

            if (view) {
                view.verify = newStatus;

                await view.save();
            }

            res.status(200).json({message: 'Status updated successfully'})

        } catch (e) {
            next(e)
        }
    }

    async getStatus(req: CustomRequest, res: Response, next: NextFunction) {
        try {
            const userStatus = req.newStatus;
            const institution = req.data_info as IInstitution;

            if (userStatus !== 'admin') {
                return next(new CustomError("Access denied", 403));
            }

            res.status(200).json(institution);
        } catch (e) {
            next(e)
        }
    }

    async allByUserId(req: CustomRequest, res: Response, next: NextFunction) {
        const user = req.userExist;
        const {_end, _start, _sort, _order, verify} = req.query;

        try {
            const {
                items,
                count
            } = await this.institutionService.getAllByUserParams(Number(_end), Number(_start), _sort, _order, user?._id, verify as string);

            res.header('x-total-count', `${count}`);
            res.header('Access-Control-Expose-Headers', 'x-total-count');

            res.status(200).json(items)
        } catch (e) {
            next(e)
        }
    }

    async similarEstablishment(req: CustomRequest, res: Response, next: NextFunction) {
        const establishment = req.data_info as IInstitution;
        try {
            const {items} = await this.institutionService.getSimilar(establishment);

            res.status(200).json({similar: items})
        } catch (e) {
            next(e)
        }
    }

    establishmentNearby = async (req: CustomRequest, res: Response, next: NextFunction) => {
        try {
            const {location, maxDistance} = req.body;

            const {items, count} = await this.institutionService.getNearby(location as {lat: number, lng: number}, maxDistance as number);

            res.header('x-total-count', `${count}`);
            res.header('Access-Control-Expose-Headers', 'x-total-count');

            res.status(200).json({nearby: items})

        } catch (e) {
            next(e)
        }
    }
}

export default new InstitutionController();