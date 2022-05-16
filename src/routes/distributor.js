var express = require("express");
var router = express.Router();
const isAuth = require("../middlewares/auth");
const distributorController = require("../controllers/distributorController");
const bookController = require("../controllers/bookController");

////distributor
router.post("/login", distributorController.registration);

////book
router.get("/books", isAuth, bookController.getAll);
router.post("/books", isAuth, bookController.create);
router.get("/books/:bookId", isAuth, bookController.getById);
router.post("/books/:bookId", isAuth, bookController.update);
router.delete("/books/:bookId", isAuth, bookController.delete);

module.exports = router;
