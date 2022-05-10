var express = require("express");
var router = express.Router();
const distributorController = require("../controllers/distributorController");
const bookController = require("../controllers/bookController");

////distributor
router.post("/register", distributorController.registration);

////book
router.post("/add", bookController.create);

module.exports = router;
