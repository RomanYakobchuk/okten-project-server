const {institutionMiddleware, authMiddleware} = require("../middlewares");
const {menuController} = require("../controllers");
const router = require("express").Router();

// one menu info
router.get(
    `/one_menu/:id`,
    authMiddleware.checkAccessToken,
    institutionMiddleware.checkInstitution('info'),
    menuController.menuByInstitutionId
)

// create menu
router.post(
    `/create/:id`,
    authMiddleware.checkAccessToken,
    institutionMiddleware.checkInstitution('info'),
    menuController.createMenu
)

module.exports = router;