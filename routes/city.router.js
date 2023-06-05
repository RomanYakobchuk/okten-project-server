const {authMiddleware} = require("../middlewares");
const {cityController} = require("../controllers");
const router = require("express").Router();

router.get(
    `/all`,
    authMiddleware.checkAccessToken,
    cityController.allCities
)


module.exports = router;