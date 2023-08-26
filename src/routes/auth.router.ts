 import {NextFunction, Router, Response} from 'express';

import {authController} from '../controllers';
import {authMiddleware, commonMiddleware, userMiddleware} from '../middlewares';
 import userFavoritePlacesMiddleware from "../middlewares/userFavoritePlaces.middleware";
 import {CustomRequest} from "../interfaces/func";

const router = Router();

router.post('/login',
    authMiddleware.isLoginBodyValid,
    authMiddleware.isUserPresentForAuth,
    authMiddleware.checkStatus('login'),
    userFavoritePlacesMiddleware.checkUserFavPlaces('login'),
    authController.login
);
router.get('/login_github',
    // authMiddleware.isLoginBodyValid,
    authMiddleware.isUserPresentForAuth,
    authMiddleware.checkStatus('login'),
    userFavoritePlacesMiddleware.checkUserFavPlaces('login'),
    authController.login
);
router.post('/register',
    userMiddleware.isUserUniqByEmail,
    userMiddleware.isUserUniqByGoogle,
    userMiddleware.isUserUniqByFacebook,
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


