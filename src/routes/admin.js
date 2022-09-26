var express = require("express");
var router = express.Router();
const isAuth = require("../middlewares/auth");
const adminController = require("../controllers/adminController");

router.post("/addDistributor", isAuth, adminController.addDistributor);
router.get("/transactions", isAuth, adminController.getAll);
module.exports = router;
