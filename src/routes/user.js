var express = require("express");
var router = express.Router();
const isAuth = require("../middlewares/auth");
const { param, body } = require("express-validator");
const validatorRegister = [
  body("email").isString().notEmpty(),
  body("userId").isString().notEmpty(),
];
//loading Controller
const userController = require("../controllers/userController");
const swapController = require("../controllers/swapController");
router.post("/registration", validatorRegister, userController.registration);

router.get("/bookshelf", isAuth, userController.getAllBooks);
router.get("/bookshelf/:bookId", isAuth, userController.getById);
router.post("/bookshelf/:bookId", isAuth, swapController.post);
module.exports = router;
