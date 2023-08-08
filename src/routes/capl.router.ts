import {authMiddleware, caplMiddleware, institutionMiddleware, commonMiddleware} from "../middlewares";
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
    caplMiddleware.isExist,
    caplMiddleware.checkAccess('update'),
    caplController.updateInfoByUser
)

router.get(
    `/allByUser`,
    authMiddleware.checkAccessToken,
    caplController.findAllByUser
)

router.post(
    `/create`,
    authMiddleware.checkAccessToken,
    commonMiddleware.isDateValid(caplValidator.createReserve, 'body'),
    institutionMiddleware.checkInstitution('info'),
    caplController.crateReservation
)

router.patch(
    `/updateByUser/:id`,
    authMiddleware.checkAccessToken,
    caplMiddleware.isExist,
    caplMiddleware.checkAccess('update'),
    caplController.updateInfoByUser
)

router.patch(
    `/updateInfoByInstitution/:id`,
    authMiddleware.checkAccessToken,
    caplMiddleware.isExist,
    caplMiddleware.checkAccess('update'),
    caplController.updateInfoByInstitution
)


export default router;