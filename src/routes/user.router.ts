import {Router} from "express";

import { userController} from '../controllers';
import {commonMiddleware, userMiddleware, authMiddleware, fileMiddleware, institutionMiddleware} from '../middlewares';
import { userQueryValidator } from '../validators';
import userFavoritePlacesMiddleware from "../middlewares/userFavoritePlaces.middleware";

const router = Router();

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
    '/addDeleteFavoritePlace/:id',
    authMiddleware.checkAccessToken,
    institutionMiddleware.checkInstitution('info'),
    userFavoritePlacesMiddleware.checkUserFavPlaces('check'),
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


export default router;