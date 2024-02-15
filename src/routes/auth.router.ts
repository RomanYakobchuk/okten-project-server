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
    authMiddleware.checkUserAgent,
    // userFavoritePlacesMiddleware.getSavedPlaces,
    // userFavoritePlacesMiddleware.checkUserFavPlaces('user', 'byUser', false),
    authController.login
);
router.get('/login_github',
    // authMiddleware.isLoginBodyValid,
    authMiddleware.isUserPresentForAuth,
    authMiddleware.checkStatus('login'),
    userFavoritePlacesMiddleware.checkUserFavPlaces('user', 'byUser', false),
    authController.login
);
router.post('/register',
    userMiddleware.isUserUniqByEmail,
    userMiddleware.isUserUniqByGoogle,
    userMiddleware.isUserUniqByFacebook,
    authController.register);

router.post('/refreshToken',
    authMiddleware.checkRefreshToken,
    authMiddleware.checkUserAgent,
    // userFavoritePlacesMiddleware.checkUserFavPlaces("tokenInfo", "byUser", true),
    authController.refreshToken);

router.post('/logout',
    authMiddleware.checkAccessToken,
    authController.logout
);

router.post('/logoutAllDevices',
    authMiddleware.checkAccessToken,
    authController.logoutAllDevices
);
router.post('/logoutSpecificDevices/:id',
    authMiddleware.checkAccessToken,
    authMiddleware.checkStatus("check"),
    authMiddleware.checkSpecificSession,
    authController.logoutSpecificDevices
);

router.get('/userSessions/:id',
    authMiddleware.checkAccessToken,
    authMiddleware.checkStatus("check"),
    userMiddleware.isUserPresent("userId"),
    authMiddleware.userSessions,
    authController.getUserSessions
);

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
 router.get(
     `/check_auth_user`,
     authMiddleware.checkAccessToken,
     authController.checkAuth
 )
 export default router;


