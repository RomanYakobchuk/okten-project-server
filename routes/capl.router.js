const {authMiddleware, caplMiddleware, institutionMiddleware, commonMiddleware} = require("../middlewares");
const {caplController} = require("../controllers");
const {caplValidator} = require("../validators");
const router = require("express").Router();

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

module.exports = router;