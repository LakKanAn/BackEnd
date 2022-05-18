var express = require("express");
var router = express.Router();
const isAuth = require("../middlewares/auth");
const distributorController = require("../controllers/distributorController");
const bookController = require("../controllers/bookController");

////distributor
router.post("/login", distributorController.registration);

////book manage
router.get("/books", isAuth, distributorController.getAll);
router.post("/books", isAuth, distributorController.create);
router.get("/books/:bookId", isAuth, distributorController.getById);
router.post("/books/:bookId", isAuth, distributorController.update);
router.delete("/books/:bookId", isAuth, distributorController.delete);

module.exports = router;
