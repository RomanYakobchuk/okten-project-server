const {commentService} = require("../services");
const {CustomError} = require("../errors");
module.exports = {
    allComments: async (req, res, next) => {
        try {

        } catch (e) {
            next(e)
        }
    },
    allCommentsByInstitutionId: async (req, res, next) => {
        try {
            const institution = req.institution;

            const comments = await commentService.getAllByParams({institutionId: institution?._id})
                .populate({path: 'createdBy', select: 'name avatar _id'})

            res.status(200).json({
                comments: comments ?? []
            })

        } catch (e) {
            next(e)
        }
    },

    allCommentsByUserId: async (req, res, next) => {
        try {
            const {userId: user} = req.user;

            const comments = await commentService.getAllByParams({createdBy: user?._id})
                .populate({path: 'institutionId', select: 'title mainPhoto type _id'})

            if (!comments) {
                return next(new CustomError("Comments not found", 404))
            }

            res.status(200).json({comments})
        } catch (e) {
            next(e)
        }
    },
    createComment: async (req, res, next) => {
        try {
            const {text} = req.body;
            const {userId: user} = req.user;
            const institution = req.institution;

            const comment = await commentService.createComment({
                text: text,
                createdBy: user?._id,
                institutionId: institution?._id
            })

            res.status(200).json({
                comment: {
                    ...comment?._doc,
                    createdBy: {
                        _id: user?._id,
                        avatar: user?.avatar,
                        name: user?.name
                    }
                }
            })
        } catch (e) {
            next(e)
        }
    }
}