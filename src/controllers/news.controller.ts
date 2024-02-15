import {NextFunction, Response} from "express";

import {CustomRequest} from "../interfaces/func";
import {NewsService, UserService, CloudService} from "../services";
import {CustomError} from "../errors";
import {IEstablishment, IEstablishmentNews, IOauth, IUser} from "../interfaces/common";
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
        this.allEstablishmentNewsByPublished = this.allEstablishmentNewsByPublished.bind(this);
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
            const establishment = req.data_info as IEstablishment;
            const {userId} = req.user as IOauth;

            const user = userId as IUser;

            const currentUser = await this.userService.findOneUser({_id: createdBy});

            if (!currentUser) {
                return next(new CustomError('UserSchema not found'));
            }
            const isUserEstablishment = currentUser?._id?.toString() === establishment?.createdBy?.toString();

            if (!isUserEstablishment && currentUser?.status !== 'admin') {
                return next(new CustomError("It is not your establishment", 403))
            }

            let newDataEvent: any[] = [];

            const currentDate = new Date();
            for (let item of dateEvent) {
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
                place: place,
                createdBy: currentUser?._id === user?._id ? user?._id : currentUser?._id,
                establishmentId: establishment?._id,
                dateEvent: newDataEvent,
                publishAt: {
                    isPublish: isDatePublished,
                    datePublish: datePublished && isDatePublished ? datePublished : currentDate
                }
            })

            establishment.news?.push(news?._id as Schema.Types.ObjectId);

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
            await establishment.save();

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
            establishment = '',
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
            } = await this.newsService.getWithPagination(Number(_end), _order, Number(_start), _sort, title_like as string, category as string, city_like as string, date_event_lte, date_event_gte, newsStatus, establishment as string, '');

            res.header('x-total-count', `${count}`);
            res.header('Access-Control-Expose-Headers', 'x-total-count');

            res.status(200).json(items)
        } catch (e) {
            next(e)
        }
    }

    async allEstablishmentNewsByPublished(req: CustomRequest, res: Response, next: NextFunction) {
        try {
            const establishment = req.data_info as IEstablishment;

            const {items, total} = await this.newsService.getNews('published', establishment?._id as string);

            res.header('x-total-count', `${total}`);
            res.header('Access-Control-Expose-Headers', 'x-total-count');

            res.status(200).json(items ?? []);
        } catch (e) {
            next(e)
        }
    }

    async newsInfo(req: CustomRequest, res: Response, next: NextFunction) {
        try {
            const news = req.news as IEstablishmentNews;
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
            const news = req.news as IEstablishmentNews;
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

            if (req.body.pictures?.url) {
                news?.pictures?.push(req.body.pictures)
            } else {
                for (let element of req.body.pictures) {
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

        const establishment = req.data_info as IEstablishment;
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
                establishment?._id as string,
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
//     const scheduledNews = await Establishment_newsSchema.find({ status: 'draft', publishAt: { $lte: currentDateTime } });
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