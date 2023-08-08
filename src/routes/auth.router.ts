 import {Router} from 'express';

import {authController} from '../controllers';
import {authMiddleware, commonMiddleware, userMiddleware} from '../middlewares';
import {userValidator} from "../validators";

const router = Router();

router.post('/login',
    authMiddleware.isLoginBodyValid,
    authMiddleware.isUserPresentForAuth,
    authMiddleware.checkStatus('login'),
    authController.login
);
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

 router.get(
     `/check_auth`,
     authMiddleware.checkAccessToken,
     authController.checkAuthAdmin
 )
 export default router;


