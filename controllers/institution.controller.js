const {Institution} = require("../dataBase");
const {s3Service, userService, institutionService} = require('../services');
const {getWithPagination} = require("../services/institution.service");
const {startSession} = require("mongoose");
const {CustomError} = require("../errors");


module.exports = {
    allInstitution: async (req, res, next) => {
        const {_end, _order, _start, _sort, title_like = "", propertyType = ""} = req.query;

        const query = {};

        if (propertyType !== '') {
            query.type = propertyType;
        }

        try {
            const {
                count,
                items
            } = await getWithPagination(Institution, query, _end, _order, _start, _sort, title_like, propertyType);

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
                city,
                type,
                description,
                contacts,
                tags,
                averageCheck,
                features,
                verify
            } = req.body;

            const {otherPhoto, mainPhoto} = req.files;
            const newWorkSchedule = JSON.parse(workSchedule)
            const newContacts = JSON.parse(contacts)
            const newTags = JSON.parse(tags)
            const newFeatures = JSON.parse(features)
            const newLocation = JSON.parse(location)

            const {userId: user} = req.user;

            const session = await startSession();
            session.startTransaction();

            const currentUser = await userService.findOneUser({email: user?.email}).session(session);

            if (!currentUser) {
                return next(new CustomError('User not found'));
            }
            const institution = await institutionService.createInstitution({
                title,
                workSchedule: newWorkSchedule,
                location: newLocation,
                city,
                type,
                createdBy: user?._id,
                description,
                contacts: newContacts,
                tags: newTags,
                mainPhoto: "",
                otherPhoto: [],
                averageCheck,
                features: newFeatures,
                verify: verify ? verify : false
            });

            const {Location: mainPhotoUrl} = await s3Service.uploadFile(mainPhoto, 'institution', institution?._id);

            institution.mainPhoto = mainPhotoUrl;

            if(otherPhoto) {
                for (let item of otherPhoto) {
                    const {Location} = await s3Service.uploadFile(item, 'institution/otherPhoto', `${institution?._id}${item?.name.toString()}`)
                    institution?.otherPhoto?.push({order: item?.name, url: Location})
                }
            }
            //
            //
            await institution.save();

            await user?.allInstitutions?.push(institution._id)
            await user.save({session});

            await session.commitTransaction();
            console.log(institution)

            res.status(200).json({message: "Institution created successful"})

        } catch (e) {
            next(e)
        }
    },

    updateInstitutionById: async (req, res, next) => {
        try {
            const {id, ...dataToUpdate} = req.body; // отримайте дані з об'єкта запиту, виключаючи ідентифікатор
            const institution = await institutionService.getOne({_id: id}); // знайдіть документ в базі даних за його ідентифікатором


            if (!institution) {
                return next(new CustomError('Institution not found'));
            }
            // перевірте кожне поле, що було надіслано з клієнта
            for (const field in dataToUpdate) {
                if (dataToUpdate.hasOwnProperty(field)) {
                    const newValue = dataToUpdate[field];
                    const oldValue = institution[field];

                    // якщо нове значення відрізняється від старого, оновіть його в базі даних
                    if (newValue !== oldValue) {
                        institution[field] = newValue;
                    }
                }
            }

            const updatedDoc = await institution.save({}); // збережіть оновлений документ у базі даних
            res.json(updatedDoc); // поверніть відповідь з оновленим документом

        } catch (e) {
            next(e)
        }
    }
}