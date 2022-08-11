var express = require("express");
var router = express.Router();
const isAuth = require("../middlewares/auth");
const { param, body } = require("express-validator");
const validatorRegister = [
  body("email").isString().notEmpty(),
  body("userId").isString().notEmpty(),
];
const userController = require("../controllers/userController");
const swapController = require("../controllers/swapController");
router.get("/", swapController.getAll);
router.get("/:offerId", swapController.getById);
router.post("/:offerId", isAuth, swapController.Offer);
module.exports = router;
