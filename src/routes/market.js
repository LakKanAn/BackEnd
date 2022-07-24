var express = require("express");
var router = express.Router();
const isAuth = require("../middlewares/auth");
const bookController = require("../controllers/bookController");

router.get("/books", bookController.getAll);
router.get("/filter", bookController.getByCategoryAndGenre);
router.get("/search", bookController.search);
router.get("/books/:bookId", bookController.getById);

module.exports = router;
