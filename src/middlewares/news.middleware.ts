import {NextFunction, Response} from "express";

import {NewsService} from "../services";
import {CustomError} from "../errors";
import {CustomRequest} from "../interfaces/func";

class NewsMiddleware {
    private newsService: NewsService;

    constructor() {
        this.newsService = new NewsService();

        this.checkNews = this.checkNews.bind(this);
    }

    async checkNews(req: CustomRequest, _: Response, next: NextFunction) {
        try {
            const {newsId, refPath} = req.body;
            const {id} = req.params;

            if (refPath === 'institution') {
                next();
            } else {
                const currentId = newsId || id || "";

                const news = await this.newsService
                    .getOneNews({_id: currentId}).populate({path: 'institutionId', select: '_id title pictures type place location'})

                if (!news) {
                    return next(new CustomError('News not found', 404));
                }
                req.news = news;
                next();
            }
        } catch (e) {
            next(e)
        }
    }
}

export default new NewsMiddleware();