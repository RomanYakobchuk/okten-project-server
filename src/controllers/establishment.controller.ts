import {Document, ObjectId, Schema} from "mongoose";
import {NextFunction, Response} from "express";

import {CustomRequest} from "../interfaces/func";
import {
    EstablishmentSchema,
    Views,
    MenuSchema,
    CityForCount,
    FreeSeatsSchema,
    EstablishmentNewsSchema,
    ReviewItemSchema,
    CommentItemSchema
} from "../dataBase";
import {
    UserService, EstablishmentService, CloudService, TokenService, NotificationService
} from '../services';
import {CustomError} from "../errors";
import {userPresenter} from "../presenters/user.presenter";
import {establishmentMiddleware} from "../middlewares";
import {IEstablishment, IOauth, IUser} from "../interfaces/common";

class EstablishmentController {

    private userService: UserService;
    private cloudService: CloudService;
    private establishmentService: EstablishmentService;
    private tokenService: TokenService;
    private notificationService: NotificationService;

    constructor() {
        this.cloudService = new CloudService();
        this.userService = new UserService();
        this.establishmentService = new EstablishmentService();
        this.tokenService = new TokenService();
        this.notificationService = new NotificationService();

        this.similarEstablishment = this.similarEstablishment.bind(this);
        this.allEstablishmentByVerify = this.allEstablishmentByVerify.bind(this);
        this.createEstablishment = this.createEstablishment.bind(this);
        this.updateEstablishmentById = this.updateEstablishmentById.bind(this);
        this.getById = this.getById.bind(this);
        this.deleteEstablishments = this.deleteEstablishments.bind(this);
        this.countByType = this.countByType.bind(this);
        this.countByCity = this.countByCity.bind(this);
        this.countMoreViews = this.countMoreViews.bind(this);
        this.uniquePlaces = this.uniquePlaces.bind(this);
        this.userEstablishmentsByQuery = this.userEstablishmentsByQuery.bind(this);
        this.updateStatus = this.updateStatus.bind(this);
        this.getStatus = this.getStatus.bind(this);
        this.allByUserId = this.allByUserId.bind(this);
        this.establishmentNearby = this.establishmentNearby.bind(this);
        this.getNumberOfEstablishmentProperties = this.getNumberOfEstablishmentProperties.bind(this);
    }

    async allEstablishmentByVerify(req: CustomRequest, res: Response, next: NextFunction) {
        const {
            _end,
            _order,
            _start,
            _sort,
            title = "",
            propertyType = "",
            averageCheck_lte,
            averageCheck_gte,
            city_like = "",
            verify = '',
            numberOfFreeSeats,
            numberOfTable,
            typeOfFreeSeats
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
            } = await this.establishmentService.getWithPagination(
                Number(_end),
                _order,
                Number(_start),
                _sort,
                title as string,
                propertyType as string,
                placeStatus as string,
                averageCheck_gte,
                averageCheck_lte,
                city_like as string,
                userStatus as string,
                numberOfFreeSeats as string,
                numberOfTable as string,
                typeOfFreeSeats as string
            );

            for (const item of items) {
                item.pictures = [item.pictures[0]]
            }
            res.header('x-total-count', `${count}`);
            res.header('Access-Control-Expose-Headers', 'x-total-count');

            res.status(200).json(items)
        } catch (e) {
            next(e)
        }
    }

    async createEstablishment(req: CustomRequest, res: Response, next: NextFunction) {
        const status = req.newStatus;
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
                createdBy,
                sendNotifications
            } = req.body;

            const {pictures} = req.files;

            const {userId} = req.user as IOauth;
            const user = userId as IUser;

            let currentUser: any = user;
            if (createdBy?.length > 0 && status === 'admin') {
                currentUser = await this.userService.findOneUser({_id: createdBy})
                if (!currentUser) {
                    return next(new CustomError('User not found'));
                }
            }

            const newVerify = user?.status === 'admin' ? verify : 'draft';

            const establishment = await this.establishmentService.createEstablishment({
                title,
                sendNotifications,
                workSchedule: workSchedule,
                location: location,
                place: place,
                type,
                createdBy: currentUser?._id,
                description,
                contacts: contacts,
                tags: tags,
                verify: newVerify,
                pictures: [],
                averageCheck,
                features: features,
            });

            if (pictures) {
                let currentPictures: any[] = [];
                if (pictures?.name) {
                    currentPictures.push(pictures);
                } else {
                    currentPictures = pictures;
                }
                const uploadedPictures = await this.cloudService.uploadPictures(`establishment/${establishment?._id}/pictures`, currentPictures);
                for (const uploadedPicture of uploadedPictures) {
                    establishment?.pictures?.push({name: uploadedPicture?.name, url: uploadedPicture.url})
                }
            }

            const viewsDB = await Views.create({
                refField: 'establishment',
                viewsWith: establishment?._id
            });

            establishment.views = viewsDB?._id;

            await establishment.save();

            await establishmentMiddleware.existCity(place?.city);

            await MenuSchema.create({
                establishmentId: establishment?._id,
                createdBy: currentUser?._id === user?._id ? user?._id : currentUser?._id,
            })

            const freeSeats = await FreeSeatsSchema.create({
                establishmentId: establishment?._id,
                list: []
            })
            establishment.freeSeats = freeSeats._id as ObjectId;

            await establishment.save();

            const notification = await this.notificationService.create({
                type: "newEstablishment",
                userId: currentUser?._id as Schema.Types.ObjectId,
                isRead: false,
                message: 'User reserved seats',
                description: establishment?._id,
                forUser: {
                    role: 'admin'
                }
            });

            if (currentUser?._id === user?._id) {
                const userForResponse = userPresenter(user);

                const {token} = await this.tokenService.tokenWithData(userForResponse, "12h");

                res.status(201).json({
                    user: token,
                    createdById: user?._id,
                    notification
                });
            } else {
                res.status(201).json({message: "EstablishmentSchema created successful"})
            }
        } catch (e) {
            console.log('Error created establishment')
            next(e)
        }
    }

    async updateEstablishmentById(req: CustomRequest, res: Response, next: NextFunction) {
        try {
            const {...dataToUpdate} = req.body;
            const establishment = req.data_info as IEstablishment;
            for (const field in dataToUpdate) {
                if (dataToUpdate.hasOwnProperty(field)) {
                    let newValue = dataToUpdate[field];
                    const oldValue = establishment[field];
                    if (field !== 'pictures' && newValue !== oldValue) {
                        establishment[field] = newValue;
                    }
                }
            }
            establishment?.pictures?.splice(0, establishment?.pictures?.length);

            for (let element of req.body.pictures) {
                establishment?.pictures?.push(element)
            }

            await establishment?.save();
            res.status(200).json({message: 'EstablishmentSchema updated successfully'});
        } catch (e) {
            next(e)
        }
    }

    async getById(req: CustomRequest, res: Response, next: NextFunction) {
        try {
            const establishment = req.data_info as IEstablishment;

            res.status(200).json(establishment);
        } catch (e) {
            next(e)
        }
    }

    async deleteEstablishments(_: CustomRequest, res: Response, next: NextFunction) {
        try {
            // const {userId: user} = req.user;
            // const establishment = req.data_info;
            // const status = req.newStatus;
            //
            // if (status !== 'admin' && user?._id?.toString() !== establishment?.createdBy?.toString()) {
            //     return next(new CustomError('Access denied', 403));
            // }
            //
            // await cloudService.deleteFile(establishment?.mainPhoto, `establishment/${establishment?._id}/mainPhoto`);
            //
            // for (const establishmentElement of establishment?.otherPhoto) {
            //     await cloudService.deleteFile(establishmentElement?.url, `establishment/${establishment?._id}/otherPhoto`)
            // }
            // user?.allestablishments?.filter((value) => value !== establishment?._id);
            //
            // await establishmentService.deleteOne({_id: establishment?._id});
            //
            // await user.save();

            res.status(200).json({message: 'Deleted successfully'})

        } catch (e) {
            next(e)
        }
    }

    async countByCity(_: CustomRequest, res: Response, next: NextFunction) {

        try {
            const cities = await CityForCount.find({}, {_id: 1, name_en: 1, name_ua: 1, url: 1});

            const result = await Promise.all(
                cities.map(async (city) => {
                    const establishmentCount = await EstablishmentSchema.countDocuments({
                        $and: [
                            {"place.city": {$regex: city.name_ua, $options: 'i'}},
                            {verify: 'published'},
                        ]
                    });
                    return {
                        _id: city._id,
                        name_ua: city.name_ua,
                        name_en: city.name_en,
                        url: city.url,
                        establishmentCount: establishmentCount,
                    };
                })
            );
            res.status(200).json(result)
        } catch (e) {
            next(e)
        }
    }

    async countByType(_: CustomRequest, res: Response, next: NextFunction) {
        try {
            const cafeCount = await EstablishmentSchema.countDocuments({type: 'cafe', verify: 'published'})
            const barCount = await EstablishmentSchema.countDocuments({type: 'bar', verify: 'published'})
            const restaurantCount = await EstablishmentSchema.countDocuments({type: 'restaurant', verify: 'published'})

            res.status(200).json([
                {type: 'cafe', count: cafeCount},
                {type: 'bar', count: barCount},
                {type: 'restaurant', count: restaurantCount},
            ])
        } catch (e) {
            next(e)
        }
    }

    async countMoreViews(_: CustomRequest, res: Response, next: NextFunction) {
        try {
            const components = await Views.getTopComponents(5);
            let data = [] as any[];

            const items: any[] = [];
            if (components) {
                data = await Promise.all(components.map((component: Document) => {
                    return component.populate({path: 'viewsWith', select: '_id pictures title type place'});
                }));

                for (const item of data) {
                    items.push({...item?._doc, url: item?.viewsWith?.pictures[0]?.url, name: item.viewsWith?.title})
                }
            }

            res.status(200).json(items)
        } catch (e) {
            next(e);
        }
    }

    async uniquePlaces(req: CustomRequest, res: Response, next: NextFunction) {
        const {keyword} = req.query;

        const regex = new RegExp(keyword as string, 'i');

        try {
            const cities = await EstablishmentSchema?.aggregate([
                {$match: {"place.city": regex}},
                {$group: {_id: "$place.city"}},
                {$limit: 20}
            ])
            res.status(200).json(cities);
        } catch (err) {
            next(err)
        }
    }

    async userEstablishmentsByQuery(req: CustomRequest, res: Response, next: NextFunction) {
        try {
            const {title_like = "", _end, _start} = req.query;
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

            const {items} = await this.establishmentService.getUserEstablishmentsByQuery(title_like as string, createdBy as string, Number(_end), Number(_start));

            res.status(200).json(items);

        } catch (e) {
            next(e)
        }
    }

    async updateStatus(req: CustomRequest, res: Response, next: NextFunction) {
        try {
            const establishment = req.data_info as IEstablishment;
            const userStatus = req.newStatus;
            const {status: newStatus} = req.body;

            if (userStatus !== 'admin') {
                return next(new CustomError('Access denied', 403));
            }

            establishment.verify = newStatus;

            await establishment.save();

            const view = await Views.findOne({viewsWith: establishment?._id, refField: 'establishment'});

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
            const establishment = req.data_info as IEstablishment;

            if (userStatus !== 'admin') {
                return next(new CustomError("Access denied", 403));
            }

            res.status(200).json(establishment);
        } catch (e) {
            next(e)
        }
    }

    async allByUserId(req: CustomRequest, res: Response, next: NextFunction) {
        const user = req.userExist;

        const {_end, _start, _sort, _order, verify, title} = req.query;

        try {
            const {
                items,
                count
            } = await this.establishmentService.getAllByUserParams(Number(_end), Number(_start), _sort, _order, user?._id as string, verify as string, title as string);

            res.header('x-total-count', `${count}`);
            res.header('Access-Control-Expose-Headers', 'x-total-count');

            res.status(200).json(items)
        } catch (e) {
            next(e)
        }
    }

    async similarEstablishment(req: CustomRequest, res: Response, next: NextFunction) {
        const establishment = req.data_info as IEstablishment;
        try {
            const {items} = await this.establishmentService.getSimilar(establishment);

            res.status(200).json(items)
        } catch (e) {
            next(e)
        }
    }

    establishmentNearby = async (req: CustomRequest, res: Response, next: NextFunction) => {
        try {
            const {locationLng, locationLat, maxDistance, _end, _start, establishmentId} = req.query;

            const {items, count} = await this.establishmentService.getNearby({
                lng: parseFloat(locationLng as string),
                lat: parseFloat(locationLat as string)
            }, parseFloat(maxDistance as string), Number(_end), Number(_start), establishmentId as string);

            res.header('x-total-count', `${count}`);
            res.header('Access-Control-Expose-Headers', 'x-total-count');

            res.status(200).json(items)

        } catch (e) {
            next(e)
        }
    }

    async getNumberOfEstablishmentProperties(req: CustomRequest, res: Response, next: NextFunction) {
        const establishment = req.data_info as IEstablishment;
        try {
            const reviewCount = await ReviewItemSchema.countDocuments({establishmentId: establishment?._id});
            const newsCount = await EstablishmentNewsSchema.countDocuments({establishmentId: establishment?._id});
            const commentCount = await CommentItemSchema.countDocuments({
                establishmentId: establishment?._id,
                parentId: null
            });

            res.status(200).json({
                reviewCount,
                commentCount,
                newsCount
            })
        } catch (e) {
            next(e);
        }
    }
}

export default new EstablishmentController();