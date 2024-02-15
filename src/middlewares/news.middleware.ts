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
            const {placeId, refPath} = req.body;
            const {id} = req.params;

            if (refPath === 'establishment') {
                next();
            } else {
                const currentId = placeId || id || "";

                const news = await this.newsService
                    .getOneNews({_id: currentId}).populate({path: 'establishmentId', select: '_id title pictures type place location'})

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