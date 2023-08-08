import {Router} from "express";

import {authMiddleware, institutionMiddleware, ratingMiddleware} from "../middlewares";
import {ratingController} from "../controllers";

const router = Router();

router.post(
    `/addRating`,
    authMiddleware.checkAccessToken,
    institutionMiddleware.checkInstitution("all_info"),
    ratingController.addRating
)
router.post(
    `/updateRating`,
    authMiddleware.checkAccessToken,
    institutionMiddleware.checkInstitution("all_info"),
    ratingMiddleware.checkRating,
    ratingController.updateRating
)


export default router;