import {Router} from "express";
import {authMiddleware, establishmentMiddleware, subscribeNotificationMiddleware} from "../middlewares";
import {subscribeNotificationController} from "../controllers";

const router = Router();

router.get(
    `/findOne/:id`,
    authMiddleware.checkAccessToken,
    establishmentMiddleware.checkEstablishment('info'),
    subscribeNotificationMiddleware.checkSubscribe,
    subscribeNotificationController.getOneSubscribe
)

router.post(
    `/updateOne/:id`,
    authMiddleware.checkAccessToken,
    establishmentMiddleware.checkEstablishment('info'),
    subscribeNotificationMiddleware.checkSubscribe,
    subscribeNotificationController.updateSubscribe
)

router.get(
    `/byUser/:id`,
    authMiddleware.checkAccessToken,
    authMiddleware.checkStatus("check"),
    subscribeNotificationMiddleware.checkAllSubscribed('subscriberId'),
    subscribeNotificationController.getAllSubscribes
)

export default router;