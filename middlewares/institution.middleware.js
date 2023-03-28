const {institutionService} = require("../services");
const {CustomError} = require("../errors");
module.exports = {
    checkInstitution: async (req, res, next) => {
        try {
            const {institutionId} = req.body;
            const {institutionId: id} = req.params;

            let institution;
            if (id) {
                institution = await institutionService.getOneInstitution({_id: id})
            } else if(!id && institutionId) {
                institution = await institutionService.getOneInstitution({_id: institutionId});
            }

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