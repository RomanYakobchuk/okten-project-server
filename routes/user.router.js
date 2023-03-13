const router = require('express').Router();

const { userController } = require('../controllers');
const { commonMiddleware, userMiddleware, authMiddleware, fileMiddleware } = require('../middlewares');
const { userValidator, userQueryValidator } = require('../validators');

router.get('/',
    commonMiddleware.isDateValid(userQueryValidator.findAll, 'query'),
    userController.findUsers);


router.get('/:id',
    commonMiddleware.isIdValid,
    authMiddleware.checkAccessToken,
    // userMiddleware.isUserPresent,
    userController.getUserById);

router.patch('/:id',
    commonMiddleware.isIdValid,
    authMiddleware.checkAccessToken,
    fileMiddleware.checkUserAvatar,
    // commonMiddleware.isDateValid(userValidator.updateUserValidator),
    // userMiddleware.isUserPresent,
    userController.updateUserById);

router.delete('/:id',
    commonMiddleware.isIdValid,
    authMiddleware.checkAccessToken,
    userMiddleware.isUserPresent,
    userController.deleteUserById);

router.patch(
    '/addDeleteFavoritePlace',
    authMiddleware.checkAccessToken,
    userController.addDeleteFavoritePlace
)

module.exports = router;