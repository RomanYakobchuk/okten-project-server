const {Comment} = require("../dataBase");
module.exports = {
    createComment: (review) => {
        return Comment.create(review);
    },
    getAllByParams: (params) => {
        return Comment.find(params)
    }
}