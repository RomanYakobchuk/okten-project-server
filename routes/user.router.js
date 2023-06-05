const router = require('express').Router();

const { userController, reviewController, commentController} = require('../controllers');
const { commonMiddleware, userMiddleware, authMiddleware, fileMiddleware} = require('../middlewares');
const { userQueryValidator } = require('../validators');

router.get(
    '/',
    commonMiddleware.isDateValid(userQueryValidator.findAll, 'query'),
    userController.findUsers
);

router.get(
    '/userInfo/:id',
    commonMiddleware.isIdValid,
    authMiddleware.checkAccessToken,
    authMiddleware.checkStatus("check"),
    // userMiddleware.isUserPresent,
    userController.getUserInfo
);

// find user with query
router.get(
    `/findUserByQuery`,
    authMiddleware.checkAccessToken,
    authMiddleware.checkStatus("check"),
    userController.findUserByQuery
)

// update user info
router.patch(
    '/userInfo/:id',
    commonMiddleware.isIdValid,
    authMiddleware.checkAccessToken,
    fileMiddleware.checkUserAvatar,
    userController.updateUserById
);

// delete user
router.delete('/:id',
    commonMiddleware.isIdValid,
    authMiddleware.checkAccessToken,
    userMiddleware.isUserPresent,
    userController.deleteUserById
);

// add or del fav place
router.post(
    '/addDeleteFavoritePlace',
    authMiddleware.checkAccessToken,
    userController.addDeleteFavoritePlace
);

// add or del fav news
router.post(
    '/addDeleteFavoriteNews',
    authMiddleware.checkAccessToken,
    userController.addDeleteFavoritePlace
);

router.patch(
    `/updateUserByAdmin/:id`,
    authMiddleware.checkAccessToken,
    authMiddleware.checkStatus('check'),
    userMiddleware.isUserPresent,
    userController.updateUserByAdmin
)


module.exports = router;