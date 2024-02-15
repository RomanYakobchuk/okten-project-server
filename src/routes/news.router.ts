import {Router} from "express";

import {authMiddleware, establishmentMiddleware, newsMiddleware, fileMiddleware, commonMiddleware} from "../middlewares";
import {newsController} from "../controllers";
import {newsValidator} from "../validators";

const router = Router();

// create one news
router.post(
    `/create`,
    authMiddleware.checkAccessToken,
    establishmentMiddleware.checkEstablishment('info'),
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
    establishmentMiddleware.checkEstablishment('info'),
    commonMiddleware.parseJsonStrings,
    commonMiddleware.isDateValid(newsValidator.updateNews, 'body'),
    fileMiddleware.checkImagesForUpdated('news'),
    newsController.updateNewsInfo
)


router.get(
    `/otherPlaceNews/:id`,
    authMiddleware.checkAccessToken,
    establishmentMiddleware.checkEstablishment('info'),
    newsController.otherPlaceNews
);

router.get(
    `/getAllByEstablishment/:id`,
    authMiddleware.checkAccessToken,
    establishmentMiddleware.checkEstablishment('info'),
    newsController.allEstablishmentNewsByPublished
)


export default router;