import {Router} from "express";

import {institutionMiddleware, authMiddleware} from "../middlewares";
import {menuController} from "../controllers";

const router = Router();

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

export default router;