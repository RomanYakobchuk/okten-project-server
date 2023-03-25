const {Rating} = require("../dataBase");
module.exports = {
    findOneRating: (params = {}) => {
        return Rating.findOne(params);
    },

    createRating: (rating) => {
        return Rating.create(rating);
    },
    findAllByInstitutionId: (institutionId) => {
        return Rating.find({institutionId})
    }
}