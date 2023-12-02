import {Router} from "express";
import {authMiddleware, notificationMiddleware, userMiddleware} from "../middlewares";
import {notificationController} from "../controllers";

const router = Router();

router.get(
    `/allByUser/:id`,
    authMiddleware.checkAccessToken,
    authMiddleware.checkStatus('check'),
    userMiddleware.isUserPresent('userId'),
    notificationMiddleware.checkByAdmin,
    notificationController.getUserNotifications('false')
)
router.get(
    `/allDeletedByUser/:id`,
    authMiddleware.checkAccessToken,
    authMiddleware.checkStatus('check'),
    userMiddleware.isUserPresent('userId'),
    notificationMiddleware.checkByAdmin,
    notificationController.getUserNotifications('true')
)
router.get(
    `/getUserCount/:id`,
    authMiddleware.checkAccessToken,
    authMiddleware.checkStatus('check'),
    userMiddleware.isUserPresent('userId'),
    notificationMiddleware.checkByAdmin,
    notificationController.getUserCount
)

router.get(
    `/allInfo/:id`,
    authMiddleware.checkAccessToken,
    authMiddleware.checkStatus('check'),
    userMiddleware.isUserPresent("userId"),
    notificationMiddleware.checkOne,
    notificationController.getAllInfo
)

router.patch(
    `/updateToFromBucket/:id`,
    authMiddleware.checkAccessToken,
    authMiddleware.checkStatus('check'),
    userMiddleware.isUserPresent("userId"),
    notificationMiddleware.checkOne,
    notificationController.updateToFromBucket
)

router.delete(
    `/delete/:id`,
    authMiddleware.checkAccessToken,
    authMiddleware.checkStatus('check'),
    userMiddleware.isUserPresent("userId"),
    notificationMiddleware.checkOne,
    notificationController.deleteNotification
)
export default router;