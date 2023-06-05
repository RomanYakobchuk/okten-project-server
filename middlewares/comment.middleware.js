const {commentService} = require("../services");
const {CustomError} = require("../errors");
module.exports = {
    checkCommentsByInstitution: async (req, res, next) => {
        try {
            const institution = req.institution;

            const comments = await commentService.getAllByParams({institutionId: institution?._id}).populate('items');

            if (!comments) {
                return res.status(404).json({message: 'Comments not found'})
            }
            req.comments = comments;
            next()
        } catch (e) {
            next(e)
        }
    },
    checkCommentById: async (req, res, next) => {
        try {
            const {id} = req.params;
            const {isAnswer} = req.body;

            let comment;
            if (isAnswer) {
                comment = await commentService.getItemAnswerByParams({_id: id});
            } else {
                comment = await commentService.getItemByParams({_id: id});
            }
            if (!comment) {
                return next(new CustomError("Comment not found", 404));
            }
            req.comment = comment;
            next()
        } catch (e) {
            next(e)
        }
    }
}