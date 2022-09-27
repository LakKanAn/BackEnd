var express = require("express");
var router = express.Router();
const isAuth = require("../middlewares/auth");
const adminController = require("../controllers/adminController");

router.post("/addDistributor", isAuth, adminController.addDistributor);
router.get("/transactions", isAuth, adminController.getTransactionAll);
router.get("/transactions/type", isAuth, adminController.getTransactionByType);
router.get("/totalUser", isAuth, adminController.getTotalUser);
router.get("/totalBook", isAuth, adminController.getTotalBook);
module.exports = router;
