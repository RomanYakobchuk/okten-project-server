const router = require('express').Router();

const { userController } = require('../controllers');
const { commonMiddleware, userMiddleware, authMiddleware, fileMiddleware, institutionMiddleware} = require('../middlewares');
const { userValidator, userQueryValidator } = require('../validators');

router.get('/',
    commonMiddleware.isDateValid(userQueryValidator.findAll, 'query'),
    userController.findUsers);


router.get('/:id',
    commonMiddleware.isIdValid,
    authMiddleware.checkAccessToken,
    // userMiddleware.isUserPresent,
    userController.getUserById);

router.get('/userInfo/:id',
    commonMiddleware.isIdValid,
    authMiddleware.checkAccessToken,
    // userMiddleware.isUserPresent,
    userController.getUserInfo);

router.get(
    `/findUserByQuery`,
    authMiddleware.checkAccessToken,
    userController.findUserByQuery
)

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

router.post(
    '/addDeleteFavoritePlace',
    authMiddleware.checkAccessToken,
    institutionMiddleware.checkInstitution,
    userController.addDeleteFavoritePlace
)

module.exports = router;