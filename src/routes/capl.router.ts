import {authMiddleware, caplMiddleware, establishmentMiddleware, commonMiddleware, userMiddleware} from "../middlewares";
import {caplController} from "../controllers";
import {caplValidator} from "../validators";

import {Router} from "express";

const router = Router();

router.get(
    `/findOne/:id`,
    authMiddleware.checkAccessToken,
    caplController.findOneById
)
router.patch(
    `/findOne/:id`,
    authMiddleware.checkAccessToken,
    authMiddleware.checkStatus('check'),
    caplMiddleware.isExist,
    caplMiddleware.checkAccess('update'),
    caplController.updateInfoByUser
)

router.get(
    `/allByUser`,
    authMiddleware.checkAccessToken,
    authMiddleware.checkStatus('check'),
    caplController.findAllByUser
)

router.post(
    `/create`,
    authMiddleware.checkAccessToken,
    authMiddleware.checkStatus('check'),
    commonMiddleware.isDateValid(caplValidator.createReserve, 'body'),
    establishmentMiddleware.checkEstablishment('info'),
    userMiddleware.isUserPresent('userId'),
    userMiddleware.isUserPresent('managerId'),
    caplController.crateReservation
)

router.patch(
    `/updateByUser/:id`,
    authMiddleware.checkAccessToken,
    caplMiddleware.isExist,
    authMiddleware.checkStatus("check"),
    caplMiddleware.checkAccess('update'),
    caplController.updateInfoByUser
)

router.patch(
    `/updateInfoByEstablishment/:id`,
    authMiddleware.checkAccessToken,
    caplMiddleware.isExist,
    authMiddleware.checkStatus("check"),
    caplMiddleware.checkAccess('update'),
    caplController.updateInfoByEstablishment
)

router.patch(
    `/updateStatus/:id`,
    authMiddleware.checkAccessToken,
    caplMiddleware.isExist,
    authMiddleware.checkStatus("check"),
    caplMiddleware.checkAccess('update'),
    caplController.updateStatus
)

export default router;