var express = require("express");
var router = express.Router();
const isAuth = require("../middlewares/auth");
const bookController = require("../controllers/bookController");

router.get("/", bookController.getAll);
router.get("/filter", bookController.getByCategoryAndGenre);
router.get("/search", bookController.search);
router.get("/:bookId", bookController.getById);

module.exports = router;
