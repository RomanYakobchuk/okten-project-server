const {newsService, s3Service, userService, cloudService} = require("../services");
const {CustomError} = require("../errors");
const {InstitutionNews} = require("../dataBase");


module.exports = {
    createNews: async (req, res, next) => {
        try {
            const {
                status,
                description,
                isDatePublished,
                datePublished,
                dateEvent,
                title,
                place,
                createdBy,
                category,
                variantForDisplay
            } = req.body;
            const {otherPhoto, mainPhoto} = req.files;
            const institution = req.data_info;
            const {userId: user} = req.user;

            const currentUser = await userService.findOneUser({_id: createdBy});

            if (!currentUser) {
                return next(new CustomError('User not found'));
            }
            const isUserInstitution = currentUser?.allInstitutions?.includes(institution?._id);

            if (!isUserInstitution && currentUser?.status !== 'admin') {
                return next(new CustomError("It is not your institution", 403))
            }

            let newDataEvent = [];

            const currentDate = new Date();
            for (let item of JSON.parse(dateEvent)) {
                item.schedule.from = item?.schedule?.from ? new Date(item?.schedule?.from).toISOString() : item?.schedule?.from;
                item.schedule.to = item?.schedule?.to ? new Date(item?.schedule?.to).toISOString() : item?.schedule?.to
                newDataEvent?.push(item)
            }
            const news = await newsService.createNews({
                status: user?.status === 'admin' ? status : "draft",
                description,
                otherPhoto: [],
                mainPhoto: "",
                variantForDisplay,
                category,
                title,
                createdBy: currentUser?._id === user?._id ? user?._id : currentUser?._id,
                institutionId: institution?._id,
                dateEvent: newDataEvent,
                // place: JSON.parse(place),
                publishAt: {
                    isPublish: JSON.parse(isDatePublished),
                    datePublish: datePublished && isDatePublished ? JSON.parse(datePublished) : currentDate
                }
            })

            institution.news?.push(news?._id);

            const {url: mainUrl} = await cloudService.uploadFile(mainPhoto?.tempFilePath, `news/${news?._id}/mainPhoto`);
            news.mainPhoto = mainUrl;

            if (otherPhoto) {
                if (otherPhoto?.name) {
                    const {url} = await cloudService.uploadFile(otherPhoto?.tempFilePath, `news/${news?._id}/otherPhoto`);
                    news?.otherPhoto?.push({name: otherPhoto?.name, url: url})
                } else {
                    for (let item of otherPhoto) {
                        const {url} = await cloudService.uploadFile(item?.tempFilePath, `news/${news?._id}/otherPhoto`)
                        news?.otherPhoto?.push({name: item?.name, url: url})
                    }
                }
            }

            await news?.save();
            await institution.save();

            res.status(200).json({message: 'News create successfully'})

        } catch
            (e) {
            next(e)
        }
    },

    allNews: async (req, res, next) => {
        const {
            _end,
            _order,
            _start,
            _sort,
            title_like = "",
            city_like,
            category,
            date_event_gte,
            date_event_lte,
            institution = '',
            status = ''
        } = req.query;
        const userStatus = req.newStatus;

        const query = {};

        if (category !== '') query.category = category;
        if (city_like !== '') query.city = city_like;
        if (date_event_lte) query.date_event_lte = date_event_lte;
        if (date_event_gte) query.date_event_gte = date_event_gte;
        if (status) query.status = status;
        if (institution) query.institutionId = institution;

        let newsStatus;
        if (userStatus === 'admin') {
            newsStatus = status
        } else {
            newsStatus = 'published'
        }

        try {
            const {
                count,
                items
            } = await newsService.getWithPagination(InstitutionNews, query, _end, _order, _start, _sort, title_like, category, city_like, date_event_lte, date_event_gte, newsStatus, institution, '');

            res.header('x-total-count', count);
            res.header('Access-Control-Expose-Headers', 'x-total-count');

            res.status(200).json(items)
        } catch (e) {
            next(e)
        }
    },
    allInstitutionsNewsByPublished: async (req, res, next) => {
        try {
            const institution = req.institution;

            const news = await newsService.getInstitutionNews('published', institution?._id);

            res.status(200).json({news: news ?? []});
        } catch (e) {
            next(e)
        }
    },
    newsInfo: async (req, res, next) => {
        try {
            const news = req.data_info;
            const {userId: user} = req.user;

            if (user?.status !== 'admin' && news?.status !== 'published' && user?._id !== news?.createdBy) {
                return next(new CustomError("News not found", 404))
            }

            res.status(200).json(news)

        } catch (e) {
            next(e)
        }
    },
    updateNewsInfo: async (req, res, next) => {
        try {
            const {...dataToUpdate} = req.body;
            const news = req.data_info;
            for (const field in dataToUpdate) {
                if (dataToUpdate.hasOwnProperty(field)) {
                    let newValue = dataToUpdate[field];
                    const oldValue = news[field];
                    if (typeof newValue === 'string' && field !== 'mainPhoto') {
                        newValue = JSON.parse(newValue);
                    }
                    if (field !== 'otherPhoto' | 'mainPhoto' && newValue !== oldValue) {
                        news[field] = newValue;
                    }
                }
            }
            news?.otherPhoto?.splice(0, news?.otherPhoto?.length);
            if (typeof req.body.otherPhoto === 'string') {
                const newPhoto = JSON.parse(req.body.otherPhoto);
                news?.otherPhoto?.push(newPhoto);
            } else {
                for (let element of req.body.otherPhoto) {
                    if (typeof element === 'string') {
                        element = JSON.parse(element)
                    }
                    news?.otherPhoto?.push(element)
                }
            }

            news.mainPhoto = req.body.mainPhoto;

            await news?.save();
            res.json({message: 'News updated successfully'});
        } catch (e) {
            next(e)
        }
    },
    otherPlaceNews: async (req, res, next) => {

        const institution = req.data_info;
        const {_sort, _order, _end, _start, newsId} = req.query;

        const query = {};


        try {
            const {items, count} = await newsService.getWithPagination(
                InstitutionNews,
                query,
                _end,
                _order,
                _start,
                _sort,
                "",
                "",
                "",
                null,
                null,
                "published",
                institution?._id,
                newsId
            );

            res.header('x-total-count', count);
            res.header('Access-Control-Expose-Headers', 'x-total-count');

            res.status(200).json(items)

        } catch (e) {
            next(e)
        }
    }
}

// async function checkScheduledNews() {
//     const currentDateTime = new Date();
//     const scheduledNews = await InstitutionNews.find({ status: 'draft', publishAt: { $lte: currentDateTime } });
//
//     for (const scheduledNew of scheduledNews) {
//         scheduledNew.status = 'published';
//         await scheduledNew.save();
//     }
// }
//
// // Розклад планувальника задач на запуск функції перевірки
// schedule.scheduleJob('*/5 * * * *', async function() {
//     await checkScheduledNews();
// });