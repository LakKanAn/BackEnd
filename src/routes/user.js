var express = require("express");
var router = express.Router();
const isAuth = require("../middlewares/auth");

//loading Controller
const userController = require("../controllers/userController");

router.get("/check", userController.checkUser);

router.post("/registration", userController.registration);

module.exports = router;
