import {Router} from "express";

import {establishmentMiddleware, authMiddleware} from "../middlewares";
import {menuController} from "../controllers";

const router = Router();

// one menu info
router.get(
    `/one_menu/:id`,
    authMiddleware.checkAccessToken,
    establishmentMiddleware.checkEstablishment('info'),
    menuController.menuByEstablishmentId
)

// create menu
router.post(
    `/create/:id`,
    authMiddleware.checkAccessToken,
    establishmentMiddleware.checkEstablishment('info'),
    menuController.createMenu
)

export default router;