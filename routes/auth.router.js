const router = require('express').Router();

const {authController} = require('../controllers');
const {authMiddleware, commonMiddleware, fileMiddleware, userMiddleware} = require('../middlewares');
const {userValidator} = require("../validators");

router.post('/login',
    authMiddleware.isLoginBodyValid,
    authMiddleware.isUserPresentForAuth,
    authController.login);

router.post('/register',
    commonMiddleware.isDateValid(userValidator.newUserValidator),
    userMiddleware.isUserUniq,
    authController.register);

router.post('/refreshToken',
    authMiddleware.checkRefreshToken,
    authController.refreshToken);

router.get('/logout',
    authMiddleware.checkAccessToken,
    authController.logout);

router.post('/logoutAllDevices',
    authMiddleware.checkAccessToken,
    authController.logoutAllDevices);

router.post('/forgotPassword',
    authMiddleware.isEmailValid,
    authMiddleware.isUserPresentByEmail,
    authController.forgotPassword);

router.post(
    '/updatePassword',
    authController.updatePassword
)
//activate account
router.get(
    `/activate/:link`,
    authController.activate
);
router.post(
    '/activate',
    authController.activateAgain
)

// verify number
router.post(
    `/verifyNumber`,
    authController.verifyNumber
)

router.post(
    `/senVerifyCodeAgain`,
    authController.sendVerifyCodeAgain
)

module.exports = router;
