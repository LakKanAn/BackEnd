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

router.post("/registration", validatorRegister, userController.registration);

router.get("/bookshelf", isAuth, userController.getAllBooks);
router.get("/bookshelf/:bookId", isAuth, userController.getById);
module.exports = router;
