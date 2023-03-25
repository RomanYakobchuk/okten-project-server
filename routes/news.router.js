const {authMiddleware, institutionMiddleware} = require("../middlewares");
const {newsController} = require("../controllers");
const router = require('express').Router();

router.post(
    `/create`,
    authMiddleware.checkAccessToken,
    institutionMiddleware.checkInstitution,
    newsController.createNews
)

router.get(
    `/all`,
    authMiddleware.checkAccessToken,
    newsController.allNewsByPublished
)

module.exports = router;