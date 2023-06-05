const {authMiddleware} = require("../middlewares");
const {managerController} = require("../controllers");
const router = require("express").Router();

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

module.exports = router;