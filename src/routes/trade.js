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
router.get("/", isAuth, swapController.getAll);
// router.get("/during", swapController.During);

router.post("/confirm/:postId/:offerId", isAuth, swapController.confirm);
router.get("/:postId", isAuth, swapController.getById);
router.post("/:postId", isAuth, swapController.Offer);

module.exports = router;
