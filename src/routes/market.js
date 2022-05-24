var express = require("express");
var router = express.Router();
const isAuth = require("../middlewares/auth");
const bookController = require("../controllers/bookController");

router.get("/books", bookController.getAll);
router.get("/coverbook/:imageName", bookController.getCoverBookImages);
router.get("/books/:bookId", bookController.getById);
router.post("/books/:bookId", isAuth, bookController.payment);

module.exports = router;
