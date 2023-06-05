const {Review} = require("../dataBase");
module.exports = {
    createReview: (review) => {
        return Review.create(review);
    },
    getAllByPlaceWithPagination: async (id, _end, _start, _sort, _order, type, path, select) => {
        if (!_sort || !_order) {
            _sort = "createdAt"
            _order = -1
        }
        if (!_start) {
            _start = 0
        }
        if (!_end) {
            _end = 20
        }
        const newSort = _sort?.split('_')[0];

        const count = await Review.countDocuments({[type]: id})

        const items = await Review
            .find({[type]: id})
            .populate({path: path, select: select})
            .limit(_end - _start)
            .skip(_start)
            .sort({[newSort]: _order})
            .exec();

        return {
            items,
            count
        }
    },
    getOneByParams: (params) => {
        return Review.findOne(params)
    }
}