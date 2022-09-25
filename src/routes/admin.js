var express = require("express");
var router = express.Router();
const isAuth = require("../middlewares/auth");
const adminController = require("../controllers/adminController");

router.post("/addDistributor", isAuth, adminController.addDistributor);

module.exports = router;
