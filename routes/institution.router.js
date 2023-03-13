const router = require('express').Router();

const {authMiddleware} = require("../middlewares");
const {institutionController} = require("../controllers");

router.get(
    `/all`,
    authMiddleware.checkAccessToken,
    institutionController.allInstitution
);


router.post(
    `/create`,
    authMiddleware.checkAccessToken,
    institutionController.createInstitution
)

module.exports = router;