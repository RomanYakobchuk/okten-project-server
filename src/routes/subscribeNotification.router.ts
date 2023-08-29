import {Router} from "express";
import {authMiddleware, institutionMiddleware, subscribeNotificationMiddleware} from "../middlewares";
import {subscribeNotificationController} from "../controllers";

const router = Router();

router.get(
    `/findOne/:id`,
    authMiddleware.checkAccessToken,
    institutionMiddleware.checkInstitution,
    subscribeNotificationMiddleware.checkSubscribe,
    subscribeNotificationController.getOneSubscribe
)

router.post(
    `/updateOne/:id`,
    authMiddleware.checkAccessToken,
    institutionMiddleware.checkInstitution('info'),
    subscribeNotificationMiddleware.checkSubscribe,
    subscribeNotificationController.updateSubscribe
)

export default router;