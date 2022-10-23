var express = require("express");
var router = express.Router();
const isAuth = require("../middlewares/auth");
const adminController = require("../controllers/adminController");

router.post("/addDistributor", isAuth, adminController.addDistributor);
router.get("/distributors", isAuth, adminController.getDistributorAll);
router.get("/transactions", isAuth, adminController.getTransactionAll);
router.get("/transactions/type", isAuth, adminController.getTransactionByType);
router.get("/totalUser", isAuth, adminController.getTotalUser);
router.get("/totalBook", isAuth, adminController.getTotalBook);
router.get("/totalDistributor", isAuth, adminController.getTotalDistributor);
router.get("/reports", isAuth, adminController.getReportAll);
router.get("/reports/:reportId", isAuth, adminController.getReportById);
module.exports = router;
