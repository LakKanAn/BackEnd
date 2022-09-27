var express = require("express");
var router = express.Router();
const isAuth = require("../middlewares/auth");
const adminController = require("../controllers/adminController");

router.post("/addDistributor", isAuth, adminController.addDistributor);
router.get("/transactions", isAuth, adminController.getTransactionAll);
router.get("/transactions/type", isAuth, adminController.getTransactionByType);
module.exports = router;
