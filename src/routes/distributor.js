var express = require("express");
var router = express.Router();
const isAuth = require("../middlewares/auth");
const distributorController = require("../controllers/distributorController");
const bookController = require("../controllers/bookController");

////distributor
router.post("/register", distributorController.registration);
router.get("/me", isAuth, distributorController.me);
////book
router.post("/add", bookController.create);

module.exports = router;
