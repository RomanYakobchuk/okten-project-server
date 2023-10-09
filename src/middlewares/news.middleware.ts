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

    async checkNews(req: CustomRequest, res: Response, next: NextFunction) {
        try {
            const {id} = req.params;

            const news = await this.newsService
                .getOneNews({_id: id}).populate({path: 'institutionId', select: '_id title pictures type place'})

            if (!news) {
                return next(new CustomError('News not found', 404));
            }
            req.news = news;
            next();
        } catch (e) {
            next(e)
        }
    }
}

export default new NewsMiddleware();