import {Router} from "express";

import {authMiddleware, cityMiddleware} from "../middlewares";
import {cityController} from "../controllers";

const router = Router();

router.get(
    `/all`,
    authMiddleware.checkAccessToken,
    cityController.allCities
)
router.get(
    `/allCountCity`,
    authMiddleware.checkAccessToken,
    cityController.allCountCities
)
router.patch(
    `/updateCityForCount/:id`,
    authMiddleware.checkAccessToken,
    authMiddleware.checkStatus('check'),
    cityMiddleware.checkCityForCount,
    cityController.updateCityForCount
)



export default router;