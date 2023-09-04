import {Router} from "express";

import {authMiddleware, institutionMiddleware, newsMiddleware, fileMiddleware, commonMiddleware} from "../middlewares";
import {newsController} from "../controllers";
import {newsValidator} from "../validators";

const router = Router();

// create one news
router.post(
    `/create`,
    authMiddleware.checkAccessToken,
    institutionMiddleware.checkInstitution('info'),
    commonMiddleware.parseJsonStrings,
    commonMiddleware.isDateValid(newsValidator.createNews, 'body'),
    newsController.createNews
)

// all published news
router.get(
    `/all`,
    authMiddleware.checkAccessToken,
    authMiddleware.checkStatus('check'),
    newsController.allNews
)

// one news info
router.get(
    `/infoById/:id`,
    authMiddleware.checkAccessToken,
    newsMiddleware.checkNews,
    newsController.newsInfo
)

// update one news info
router.patch(
    `/infoById/:id`,
    authMiddleware.checkAccessToken,
    newsMiddleware.checkNews,
    institutionMiddleware.checkInstitution('info'),
    commonMiddleware.parseJsonStrings,
    commonMiddleware.isDateValid(newsValidator.updateNews, 'body'),
    fileMiddleware.checkImagesForUpdated('news'),
    newsController.updateNewsInfo
)


router.get(
    `/otherPlaceNews/:id`,
    authMiddleware.checkAccessToken,
    institutionMiddleware.checkInstitution('info'),
    newsController.otherPlaceNews
)


export default router;