const {commentService} = require("../services");
const {CustomError} = require("../errors");

module.exports = {
    allComments: async (req, res, next) => {
        const {
            _end,
            _order,
            _start,
            _sort,
            text_like = "",
            day_gte,
            user = '',
            institution = ''
        } = req.query;

        const userStatus = req.newStatus;

        if (userStatus !== 'admin') {
            return next(new CustomError("Access denied", 403));
        }

        const query = {};

        if (text_like !== '') query.text = text_like;
        if (user !== '') query.createdBy = user;
        if (day_gte) query.createdAt = day_gte;
        if (institution) query.institutionId = institution;
        try {

            const {
                count,
                items
            } = await commentService.getWithPagination(query, _end, _order, _start, _sort, text_like, user, institution, day_gte);

            res.header('x-total-count', count);
            res.header('Access-Control-Expose-Headers', 'x-total-count');

            res.status(200).json(items)
        } catch (e) {
            next(e)
        }
    },
    allCommentsByInstitutionUserId: (type) => async (req, res, next) => {
        const {_order, _sort, _end, _start} = req.query;
        const {userId: user} = req.user;

        try {
            let id = '';
            if (type === 'institutionId') {
                const institution = req.data_info;
                id = institution?._id
            } else if (type === 'createdBy') {
                const currentUser = req.userExist;
                id = currentUser?._id;
                if (id?.toString() !== user?._id?.toString() && user?.status !== 'admin') {
                    return next(new CustomError("Access denied", 403))
                }
            }
            const {
                items,
                count
            } = await commentService.getAllByPlaceWithPagination(id, _end, _start, _sort, _order, type)

            res.header('x-total-count', count);
            res.header('Access-Control-Expose-Headers', 'x-total-count');

            res.status(200).json(items);

        } catch (e) {
            next(e)
        }
    },
    allAnsweredCommentById: async (req, res, next) => {
        const comment = req.comment;
        const {_end, _start} = req.query;
        try {
            const {count, items} = await commentService.getAllAnswerComments(comment?._id, _end, _start);

            res.header('x-total-count', count);
            res.header('Access-Control-Expose-Headers', 'x-total-count');

            res.status(200).json(items);
        } catch (e) {
            next(e)
        }
    },
    allCommentsByUserId: async (req, res, next) => {
        try {
            const {userId: user} = req.user;
            const {id} = req.params;

            if (id !== user?._id?.toString() && user?.status !== 'admin') {
                return next(new CustomError("Access denied", 403))
            }
            let searchId = '';
            if (user?.status === 'admin') {
                searchId = id
            } else {
                searchId = user?._id
            }

            const comments = await commentService.getItemsByParams({createdBy: searchId})
                .populate([{path: 'institutionId', select: 'title mainPhoto type _id'}, {
                    path: 'createdBy',
                    select: 'avatar name _id'
                }])


            res.status(200).json({
                user_comments: comments ?? []
            })
        } catch (e) {
            next(e)
        }
    },
    createComment: async (req, res, next) => {
        try {
            const {text, isAnswer, parentId} = req.body;
            const {userId: user} = req.user;
            const institution = req.data_info;

            if (isAnswer && parentId) {
                const comment = await commentService.getItemByParams({_id: parentId});
                if (!comment) {
                    return next(new CustomError("Comment not found", 404));
                }
                const answer = await commentService.createAnswerComment({
                    text: text,
                    parentCommentId: comment?._id,
                    createdBy: user?._id
                });

                comment.replies.push(answer?._id);
                await comment.save();
            } else {
                await commentService.createCommentItem({
                    text: text,
                    createdBy: user?._id,
                    institutionId: institution?._id,
                })
            }

            res.status(200).json({message: "Comment added successfully"})
        } catch (e) {
            next(e)
        }
    },
    deleteComment: async (req, res, next) => {
        try {
            const {userId: user} = req.user;
            const {isAnswer} = req.body;
            const comment = req.comment;

            if (user?._id?.toString() !== comment?.createdBy?.toString() && user?.status !== "admin") {
                return res.status(403).json({message: 'It is not your comment'})
            }
            if (isAnswer) {
                const parent = await commentService.getItemByParams({_id: comment?.parentCommentId});
                parent.replies.pull(comment?._id);
                await parent.save();
                await commentService.deleteAnswerComment(comment?._id);
            } else {
                await commentService.deleteComment(comment?._id);
            }

            res.status(204).json({message: 'Comment deleted success'});

        } catch (e) {
            next(e)
        }
    }
}