const {institutionService, s3Service} = require("../services");
const {CustomError} = require("../errors");
const {City} = require("../dataBase");
module.exports = {
    checkInstitution: (type) => async (req, res, next) => {
        try {
            const {institutionId} = req.body;
            const {id} = req.params;

            let institution, currentId;

            if (id) {
                currentId = id
            } else if (!id && institutionId) {
                currentId = institutionId
            }
            if (type === 'info') {
                institution = await institutionService.getOneInstitution({_id: currentId})
            } else if (type === 'all_info') {
                institution = await institutionService.getOneInstitution({_id: currentId})
                    .populate("news")
                    .populate({
                        path: 'views',
                        select: 'viewsNumber _id'
                    });
            }

            if (!institution) {
                return next(new CustomError("Institution not found", 404))
            }

            req.data_info = institution;
            next();
        } catch (e) {
            next(e)
        }
    },

    existCity: (city) => async (req, res, next) => {
        try {
            const cityExist = await City.findOne({name: {$regex: new RegExp(city, "i")}});

            if (!cityExist) {
                await City.create({
                    name: city
                })
            }
            next()
        } catch (e) {
            next(e)
        }
    }
}