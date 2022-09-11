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
router.get("/bookpost", isAuth, userController.getAllPost);
router.get("/booktrade", isAuth, userController.getAllTrade);
router.get("/bookpost/:postId", isAuth, userController.getPostById);
router.get("/booktrade/:exchangeId", isAuth, userController.getByIdBookTrade);
router.get("/bookshelf/:bookId", isAuth, userController.getById);
router.post("/bookshelf/:bookId/post", isAuth, swapController.post);
router.post("/bookshelf/:postId/cancel", isAuth, swapController.cancel);
module.exports = router;
