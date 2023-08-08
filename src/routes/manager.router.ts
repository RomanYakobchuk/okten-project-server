import {Router} from "express";
import {authMiddleware} from "../middlewares";
import {managerController} from "../controllers";

const router = Router();

// find manager for create inst
router.get(
    '/all',
    authMiddleware.checkAccessToken,
    managerController.managers
);

router.get(
    `/one/:id`,
    authMiddleware.checkAccessToken,
    managerController.oneManager
)

export default router;