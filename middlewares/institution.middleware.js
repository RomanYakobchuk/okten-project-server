const {institutionService} = require("../services");
const {CustomError} = require("../errors");
module.exports = {
    checkInstitution: async (req, res, next) => {
        try {
            const {institutionId} = req.body;

            const institution = await institutionService.getOneInstitution({_id: institutionId});

            if (!institution) {
                return next(new CustomError("Institution not found", 404))
            }

            req.institution = institution;
            next();
        } catch (e) {
            next(e)
        }
    }
}