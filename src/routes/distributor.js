var express = require("express");
var router = express.Router();
const isAuth = require("../middlewares/auth");
const uploadBooKCover = require("../middlewares/multer");
const distributorController = require("../controllers/distributorController");
const { param, body } = require("express-validator");
const validatorFindOne = [param("bookId").isString().notEmpty()];
const validatorRegister = [
  body("email").isString().notEmpty(),
  body("distributorId").isString().notEmpty(),
];
////distributor
router.post(
  "/registration",
  validatorRegister,
  distributorController.registration
);

////book manage
router.get("/books", isAuth, distributorController.getAll);
router.post("/books", isAuth, distributorController.create);
router.post(
  "/books/:bookId",
  [isAuth, uploadBooKCover.single("image")],
  distributorController.addImage
);
router.get(
  "/books/:bookId",
  [isAuth, validatorFindOne],
  distributorController.getById
);
router.post(
  "/books/:bookId",
  [isAuth, validatorFindOne],
  distributorController.update
);
router.delete(
  "/books/:bookId",
  [isAuth, validatorFindOne],
  distributorController.delete
);

module.exports = router;
