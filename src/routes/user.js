var express = require("express");
var router = express.Router();
const isAuth = require("../middlewares/auth");

//loading Controller
const userController = require("../controllers/userController");
const receipt = require("../models/receipt");
router.post("/registration", userController.registration);

router.get("/receipt", receipt.generateReceipt);
module.exports = router;
