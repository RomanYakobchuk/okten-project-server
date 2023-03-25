const router = require('express').Router();

const {authMiddleware} = require("../middlewares");
const {institutionController} = require("../controllers");

router.get(
    `/all`,
    authMiddleware.checkAccessToken,
    institutionController.allInstitutionByVerify
);


router.post(
    `/create`,
    authMiddleware.checkAccessToken,
    institutionController.createInstitution
)

router.get(
    `/byId/:id`,
    authMiddleware.checkAccessToken,
    institutionController.getById
)

router.patch(
    `/updateOne/:id`,
    authMiddleware.checkAccessToken,
    institutionController.updateInstitutionById
)

module.exports = router;