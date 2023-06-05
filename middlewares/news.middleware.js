const {newsService} = require("../services");
const {CustomError} = require("../errors");
module.exports = {
    checkNews: async (req, res, next) => {
        try {
            const {id} = req.params;

            const news = await newsService
                .getOneNews({_id: id})

            if (!news) {
                return next(new CustomError('News not found'), 404);
            }
            req.data_info = news;
            next();
        } catch (e) {
            next(e)
        }
    }
}