var express = require("express");
var router = express.Router();
const isAuth = require("../middlewares/auth");

//loading Controller
const userController = require("../controllers/userController");

router.post("/register", userController.registration);
router.get("/me", isAuth, userController.me);

module.exports = router;
