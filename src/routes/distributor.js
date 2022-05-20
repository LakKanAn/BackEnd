var express = require("express");
var router = express.Router();
const isAuth = require("../middlewares/auth");
const distributorController = require("../controllers/distributorController");
const bookController = require("../controllers/bookController");
const { param } = require("express-validator");
const validatorFindOne = [param("bookId").isString().notEmpty()];
////distributor
router.post("/registration", distributorController.registration);

////book manage
router.get("/books", isAuth, distributorController.getAll);
router.post("/books", isAuth, distributorController.create);
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
