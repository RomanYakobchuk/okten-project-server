import {Router} from "express";

import {authMiddleware} from "../middlewares";
import {cityController} from "../controllers";

const router = Router();

router.get(
    `/all`,
    authMiddleware.checkAccessToken,
    cityController.allCities
)



export default router;