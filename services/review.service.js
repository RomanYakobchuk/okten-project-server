const {Review} = require("../dataBase");
module.exports = {
    createReview: (review) => {
        return Review.create(review);
    },
    getAllByParams: (params) => {
        return Review.find(params)
    }
}