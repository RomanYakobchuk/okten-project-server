import {Router} from "express";

import {savedPlacesController, userController} from '../controllers';
import {
    commonMiddleware,
    userMiddleware,
    authMiddleware,
    fileMiddleware,
    institutionMiddleware,
    newsMiddleware
} from '../middlewares';
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
    userMiddleware.isUserPresent,
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
    commonMiddleware.parseJsonStrings,
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
    newsMiddleware.checkNews,
    institutionMiddleware.checkInstitution('info'),
    userFavoritePlacesMiddleware.checkOne,
    savedPlacesController.savePlace
);


router.patch(
    `/updateUserByAdmin/:id`,
    authMiddleware.checkAccessToken,
    authMiddleware.checkStatus('check'),
    userMiddleware.isUserPresent,
    userController.updateUserByAdmin
)

router.get(
    `/getUserFavPlaces`,
    authMiddleware.checkAccessToken,
    authMiddleware.checkStatus('check'),
    userFavoritePlacesMiddleware.getSavedPlaces("withoutData"),
    // userFavoritePlacesMiddleware.checkUserFavPlaces("user", "byUser", true),
    savedPlacesController.getUserFavPlaces
)
router.get(
    `/getByUserIdFavPlaces/:id`,
    authMiddleware.checkAccessToken,
    authMiddleware.checkStatus('check'),
    userFavoritePlacesMiddleware.getSavedPlaces("withData"),
    // userFavoritePlacesMiddleware.checkUserFavPlaces("user", "byId", true),
    savedPlacesController.getUserFavPlaces
)

router.get(
    `/checkUniqueIndicator/:id`,
    authMiddleware.checkAccessToken,
    userMiddleware.isUserPresent('userId'),
    userMiddleware.checkUniqueIndicator({type: 'create'}),
    userController.checkUniqueIndicator
)
router.post(
    `/findUserByIndicator/:id`,
    authMiddleware.checkAccessToken,
    userMiddleware.isUserPresent('userId'),
    userMiddleware.checkUniqueIndicator({type: 'find'}),
    userController.findUserByIndicator
)
router.post(
    `/createUniqueIndicator/:id`,
    authMiddleware.checkAccessToken,
    userMiddleware.isUserPresent('userId'),
    userMiddleware.checkUniqueIndicator({type: 'create'}),
    userController.createUniqueIndicator
)
export default router;