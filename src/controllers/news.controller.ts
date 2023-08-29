import {NextFunction, Response} from "express";

import {CustomRequest} from "../interfaces/func";
import {NewsService, UserService, CloudService} from "../services";
import {CustomError} from "../errors";
import {IInstitution, IInstitutionNews, IOauth, IUser} from "../interfaces/common";
import {Schema} from "mongoose";


class NewsController {

    private newsService: NewsService;
    private userService: UserService;
    private cloudService: CloudService;

    constructor() {
        this.newsService = new NewsService();
        this.userService = new UserService();
        this.cloudService = new CloudService();

        this.createNews = this.createNews.bind(this);
        this.allNews = this.allNews.bind(this);
        this.allInstitutionsNewsByPublished = this.allInstitutionsNewsByPublished.bind(this);
        this.newsInfo = this.newsInfo.bind(this);
        this.updateNewsInfo = this.updateNewsInfo.bind(this);
        this.otherPlaceNews = this.otherPlaceNews.bind(this);
    }

    async createNews(req: CustomRequest, res: Response, next: NextFunction) {
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
            } = req.body;
            const {pictures} = req.files;
            const institution = req.data_info as IInstitution;
            const {userId} = req.user as IOauth;

            const user = userId as IUser;

            const currentUser = await this.userService.findOneUser({_id: createdBy});

            if (!currentUser) {
                return next(new CustomError('UserSchema not found'));
            }
            const isUserInstitution = currentUser?._id?.toString() === institution?.createdBy?.toString();

            if (!isUserInstitution && currentUser?.status !== 'admin') {
                return next(new CustomError("It is not your institution", 403))
            }

            let newDataEvent: any[] = [];

            const currentDate = new Date();
            for (let item of JSON.parse(dateEvent)) {
                item.schedule.from = item?.schedule?.from ? new Date(item?.schedule?.from).toISOString() : item?.schedule?.from;
                item.schedule.to = item?.schedule?.to ? new Date(item?.schedule?.to).toISOString() : item?.schedule?.to
                newDataEvent?.push(item)
            }
            const news = await this.newsService.createNews({
                status: status,
                description,
                pictures: [],
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

            institution.news?.push(news?._id as Schema.Types.ObjectId);

            if (pictures) {
                let currentPictures: any[] = [];
                if (pictures?.name) {
                    currentPictures.push(pictures);
                } else {
                    currentPictures = pictures;
                }
                const uploadedPictures = await this.cloudService.uploadPictures(`news/${news?._id}/pictures`, currentPictures);
                for (const uploadedPicture of uploadedPictures) {
                    news?.pictures?.push({name: uploadedPicture.name, url: uploadedPicture.url})
                }
            }

            await news?.save();
            await institution.save();

            res.status(200).json({message: 'News create successfully'})

        } catch
            (e) {
            next(e)
        }
    }

    async allNews(req: CustomRequest, res: Response, next: NextFunction) {
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

        let newsStatus: string;
        if (userStatus === 'admin') {
            newsStatus = status as string;
        } else {
            newsStatus = 'published'
        }

        try {
            const {
                count,
                items
            } = await this.newsService.getWithPagination(Number(_end), _order, Number(_start), _sort, title_like as string, category as string, city_like as string, date_event_lte, date_event_gte, newsStatus, institution as string, '');

            res.header('x-total-count', `${count}`);
            res.header('Access-Control-Expose-Headers', 'x-total-count');

            res.status(200).json(items)
        } catch (e) {
            next(e)
        }
    }

    async allInstitutionsNewsByPublished(req: CustomRequest, res: Response, next: NextFunction) {
        try {
            const institution = req.data_info as IInstitution;

            const news = await this.newsService.getInstitutionNews('published', institution?._id as string);

            res.status(200).json({news: news ?? []});
        } catch (e) {
            next(e)
        }
    }

    async newsInfo(req: CustomRequest, res: Response, next: NextFunction) {
        try {
            const news = req.data_info as IInstitutionNews;
            const {userId} = req.user as IOauth;
            const user = userId as IUser;

            if (user?.status !== 'admin' && news?.status !== 'published' && user?._id !== news?.createdBy) {
                return next(new CustomError("News not found", 404))
            }

            res.status(200).json(news)

        } catch (e) {
            next(e)
        }
    }

    async updateNewsInfo(req: CustomRequest, res: Response, next: NextFunction) {
        try {
            const {...dataToUpdate} = req.body;
            const news = req.data_info as IInstitutionNews;
            for (const field in dataToUpdate) {
                if (dataToUpdate.hasOwnProperty(field)) {
                    let newValue = dataToUpdate[field];
                    const oldValue = news[field];
                    if (field !== 'pictures' && newValue !== oldValue) {
                        news[field] = newValue;
                    }
                }
            }
            news?.pictures?.splice(0, news?.pictures?.length);
            if (typeof req.body.pictures === 'string') {
                const newPhoto = JSON.parse(req.body.pictures);
                news?.pictures?.push(newPhoto);
            } else {
                for (let element of req.body.pictures) {
                    if (typeof element === 'string') {
                        element = JSON.parse(element)
                    }
                    news?.pictures?.push(element)
                }
            }

            await news?.save();
            res.json({message: 'News updated successfully'});
        } catch (e) {
            next(e)
        }
    }

    async otherPlaceNews(req: CustomRequest, res: Response, next: NextFunction) {

        const institution = req.data_info as IInstitution;
        const {_sort, _order, _end, _start, newsId} = req.query;

        try {
            const {items, count} = await this.newsService.getWithPagination(
                Number(_end),
                _order,
                Number(_start),
                _sort,
                "",
                "",
                "",
                null,
                null,
                "published",
                institution?._id as string,
                newsId as string
            );

            res.header('x-total-count', `${count}`);
            res.header('Access-Control-Expose-Headers', 'x-total-count');

            res.status(200).json(items)

        } catch (e) {
            next(e)
        }
    }
}

// async function checkScheduledNews() {
//     const currentDateTime = new Date();
//     const scheduledNews = await Institution_newsSchema.find({ status: 'draft', publishAt: { $lte: currentDateTime } });
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

export default new NewsController();