var express = require("express");
var router = express.Router();
const isAuth = require("../middlewares/auth");

//loading Controller
const payController = require("../controllers/paymentController");
router.post("/create/:bookId", isAuth, payController.create);
router.put("/confirm/:bookId", isAuth, payController.confirm);
module.exports = router;
