const mongoose = require("mongoose");

const {startSession} = mongoose;
const {Institution, Views, Menu} = require("../dataBase");
const {
    userService,
    institutionService,
    cloudService
} = require('../services');
const {CustomError} = require("../errors");
const {userPresenter} = require("../presenters/user.presenter");
const {tokenWithData} = require("../services/token.service");
const {institutionMiddleware} = require("../middlewares");


module.exports = {
    allInstitutionByVerify: async (req, res, next) => {
        const {
            _end,
            _order,
            _start,
            _sort,
            title_like = "",
            type = "",
            tag_like,
            averageCheck_lte,
            averageCheck_gte,
            city_like = "",
            verify = ''
        } = req.query;

        const userStatus = req.newStatus;

        const query = {};

        if (type !== '') query.type = type;
        if (city_like !== '') query.city_like = city_like;
        if (averageCheck_lte === undefined) query.averageCheck_lte = 100000;
        if (averageCheck_gte === undefined) query.averageCheck_gte = 0;
        if (tag_like !== '') query.tags = tag_like;
        if (verify !== '') query.verify = verify;

        let placeStatus = '';
        if (userStatus === 'admin') {
            placeStatus = verify
        } else {
            placeStatus = 'published'
        }
        try {
            const {
                count,
                items
            } = await institutionService.getWithPagination(Institution, query, _end, _order, _start, _sort, title_like, type, tag_like, placeStatus, averageCheck_gte, averageCheck_lte, city_like, userStatus);

            res.header('x-total-count', count);
            res.header('Access-Control-Expose-Headers', 'x-total-count');

            res.status(200).json(items)
        } catch (e) {
            next(e)
        }
    },
    createInstitution: async (req, res, next) => {
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
                variantForDisplay,
                createdBy
            } = req.body;

            const {otherPhoto, mainPhoto} = req.files;
            const newPlace = JSON.parse(place)

            const {userId: user} = req.user;

            const session = await startSession();
            session.startTransaction();

            let currentUser;
            if (createdBy?.length > 0) {
                currentUser = await userService.findOneUser({_id: createdBy}).session(session);
                if (!currentUser) {
                    return next(new CustomError('User not found'));
                }
            }

            const newVerify = user?.status === 'admin' ? verify : 'draft';

            const institution = await institutionService.createInstitution({
                title,
                workSchedule: JSON.parse(workSchedule),
                location: JSON.parse(location),
                place: newPlace,
                type,
                createdBy: currentUser?._id === user?._id ? user?._id : currentUser?._id,
                description,
                contacts: JSON.parse(contacts),
                tags: JSON.parse(tags),
                verify: newVerify,
                variantForDisplay,
                mainPhoto: "",
                otherPhoto: [],
                averageCheck,
                features: JSON.parse(features),
            });

            const {url: mainUrl} = await cloudService.uploadFile(mainPhoto?.tempFilePath, `institution/${institution?._id}/mainPhoto`);
            institution.mainPhoto = mainUrl;

            if (otherPhoto) {
                if (otherPhoto?.name) {
                    const {url} = await cloudService.uploadFile(otherPhoto?.tempFilePath, `institution/${institution?._id}/otherPhoto`);
                    // const Location = await s3Service.uploadFile(otherPhoto, `institution/${institution?._id}/otherPhoto`, `${institution?._id}${otherPhoto?.name.toString()}`)
                    institution?.otherPhoto?.push({name: otherPhoto?.name, url})
                } else {
                    for (let item of otherPhoto) {
                        const {url} = await cloudService.uploadFile(item?.tempFilePath, `institution/${institution?._id}/otherPhoto`);
                        // const Location = await s3Service.uploadFile(item, `institution/${institution?._id}/otherPhoto`, `${institution?._id}${item?.name.toString()}`)
                        institution?.otherPhoto?.push({name: item?.name, url})
                    }
                }
            }

            await session.commitTransaction();

            const viewsDB = await Views.create({
                refField: 'institution',
                viewsWith: mongoose.mongo.ObjectId(institution?._id)
            });

            institution.views = viewsDB?._id;

            await institution?.save({session});

            await institutionMiddleware.existCity(newPlace?.city);

            await Menu.create({
                institutionId: institution?._id,
                createdBy: currentUser?._id === user?._id ? user?._id : currentUser?._id,
            })

            if (currentUser?._id === user?._id) {
                const userForResponse = userPresenter(user);

                const {token} = tokenWithData(userForResponse, "12h");

                res.status(201).json({user: token, createdById: user?._id});
            } else {
                res.status(201).json({message: "Institution created successful"})
            }
        } catch (e) {
            console.log('Error created institution')
            next(e)
        }
    },

    updateInstitutionById: async (req, res, next) => {
        try {
            const {...dataToUpdate} = req.body;
            const institution = req.data_info;
            for (const field in dataToUpdate) {
                if (dataToUpdate.hasOwnProperty(field)) {
                    let newValue = dataToUpdate[field];
                    const oldValue = institution[field];
                    if (typeof newValue === 'string' && field !== 'mainPhoto') {
                        newValue = JSON.parse(newValue);
                    }
                    if (field !== 'otherPhoto' | 'mainPhoto' && newValue !== oldValue) {
                        institution[field] = newValue;
                    }
                }
            }
            institution?.otherPhoto?.splice(0, institution?.otherPhoto?.length);
            if (typeof req.body.otherPhoto === 'string') {
                const newPhoto = JSON.parse(req.body.otherPhoto);
                institution?.otherPhoto?.push(newPhoto);
            } else {
                for (let element of req.body.otherPhoto) {
                    if (typeof element === 'string') {
                        element = JSON.parse(element)
                    }
                    institution?.otherPhoto?.push(element)
                }
            }

            institution.mainPhoto = req.body.mainPhoto;

            await institution?.save();
            res.json({message: 'Institution updated successfully'});
        } catch (e) {
            next(e)
        }
    },

    getAllInfoById: async (req, res, next) => {
        try {
            const {id} = req.params;
            const {userId: user} = req.user;

            const institution = req.data_info;

            if (user?._id !== institution?.createdBy && institution?.verify !== "published" && user?.status !== 'admin') {
                return next(new CustomError("Institution not found", 404))
            }

            if (user?._id?.toString() !== institution?.createdBy?.toString()) {
                let currentViews = await Views.findById(institution?.views?._id);

                if (!currentViews || currentViews.viewsWith?.toString() !== institution?._id?.toString()) {
                    currentViews = await Views.create({
                        refField: 'institution',
                        viewsWith: institution?._id
                    })

                    institution.views = currentViews?._id;
                    await institution.save();
                }

                const isInclude = currentViews.views?.includes(user?._id);
                if (!isInclude) {
                    currentViews.views?.push(user?._id);
                    currentViews.viewsNumber++;

                    console.log('added successfully')
                    await currentViews.save();
                }
            }
            res.status(200).json(institution)
        } catch (e) {
            next(e)
        }
    },

    getById: async (req, res, next) => {
        try {
            const institution = req.data_info;

            res.status(200).json(institution);
        } catch (e) {
            next(e)
        }
    },

    deleteInstitutions: async (req, res, next) => {
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
    },

    countByCity: async (req, res, next) => {
        const cities = req.query?.cities?.split(',');
        try {
            const list = await Promise.all(
                cities?.map((city) => {
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
    },
    countByType: async (req, res, next) => {
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
    },
    countMoreViews: async (req, res, next) => {
        try {
            const components = await Views?.getTopComponents(5);
            const promises = components.map(component => {
                return component.populate({path: 'viewsWith', select: '_id mainPhoto title type place'});
            });

            const data = await Promise.all(promises);
            res.status(200).json(data)
        } catch (e) {
            next(e);
        }
    },

    uniquePlaces: async (req, res, next) => {
        const {keyword} = req.query;

        const regex = new RegExp(keyword, 'i');

        try {
            const cities = await Institution?.aggregate([
                {$group: {"place.city": regex}},
                {$limit: 20}
            ])
            res.status(200).json(cities);
        } catch (err) {
            next(err)
        }
    },

    userInstitutionsByQuery: async (req, res, next) => {
        try {
            const {title_like = ""} = req.query;
            const {userId: user} = req.user;
            const userStatus = req.newStatus;

            const query = {};

            if (title_like !== "") {
                query.title = title_like
            }
            const createdBy = userStatus === 'admin' ? 'all' : userStatus === 'manager' ? user?._id : false;
            if (createdBy === false) {
                return next(new CustomError("Access denied", 403));
            }

            const {items} = await institutionService.getUserInstitutionsByQuery(title_like, createdBy);

            res.status(200).json(items);

        } catch (e) {
            next(e)
        }
    },
    updateStatus: async (req, res, next) => {
        try {
            const institution = req.data_info;
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
    },
    getStatus: async (req, res, next) => {
        try {
            const userStatus = req.newStatus;
            const institution = req.data_info;

            if (userStatus !== 'admin') {
                return next(new CustomError("Access denied", 403));
            }

            res.status(200).json(institution);
        } catch (e) {
            next(e)
        }
    },
    allByUserId: async (req, res, next) => {
        const user = req.userExist;
        const {_end, _start, _sort, _order, verify} = req.query;

        try {
            const {items, count} = await institutionService.getAllByUserParams(_end, _start, _sort, _order, user?._id, verify);

            res.header('x-total-count', count);
            res.header('Access-Control-Expose-Headers', 'x-total-count');

            res.status(200).json(items)
        } catch (e) {
            next(e)
        }
    }
}