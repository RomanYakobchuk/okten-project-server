const {newsService, s3Service, userService} = require("../services");
const {CustomError} = require("../errors");
const {InstitutionNews} = require("../dataBase");
module.exports = {
    createNews: async (req, res, next) => {
        try {
            const {status, description, dataEvent, title, createdBy, category} = req.body;
            const {photos, mainPhoto} = req.files;
            const {_id} = req.institution;
            const {userId: user} = req.user;

            const currentUser = await userService.findOneUser({_id: createdBy});

            if (!currentUser) {
                return next(new CustomError('User not found'));
            }
            const isUserInstitution = currentUser?.allInstitutions?.includes(_id);

            if (!isUserInstitution && !currentUser?.isAdmin) {
                return next(new CustomError("It is not your institution", 403))
            }

            const newDataEvent = JSON.parse(dataEvent);

            const news = await newsService.createNews({
                status: user?.isAdmin ? status : "draft",
                description,
                photos: [],
                mainPhoto: "",
                category,
                title,
                createdBy: currentUser?._id === user?._id ? user?._id : currentUser?._id,
                institutionId: _id,
                dataEvent: newDataEvent,
            })
            const {Location: mainPhotoUrl} = await s3Service.uploadFile(mainPhoto, 'news/mainPhoto', `${news?._id}${mainPhoto?.name.toString()}`);

            news.mainPhoto = mainPhotoUrl;

            if (photos) {
                for (let item of photos) {
                    const {Location} = await s3Service.uploadFile(item, 'news/photos', `${news?._id}${item?.name.toString()}`)
                    news?.photos?.push({name: item?.name, url: Location})
                }
            }

            await news.save();

            res.status(200).json({message: 'News create successfully'})

        } catch (e) {
            next(e)
        }
    },

    allNewsByPublished: async (req, res, next) => {
        const {_end, _order, _start, _sort, title_like = "", propertyType} = req.query;

        const query = {};

        if (propertyType !== '') {
            query.type = propertyType;
        }

        try {
            const {
                count,
                items
            } = await newsService.getWithPagination(InstitutionNews, query, _end, _order, _start, _sort, title_like, propertyType, "published");

            res.header('x-total-count', count);
            res.header('Access-Control-Expose-Headers', 'x-total-count');

            res.status(200).json(items)
        } catch (e) {
            next(e)
        }
    },
}