var express = require("express");
var router = express.Router();
const isAuth = require("../middlewares/auth");
const swapController = require("../controllers/swapController");

router.get("/", isAuth, swapController.getAll);
router.post("/confirm/:postId/:offerId", isAuth, swapController.confirm);
router.get("/:postId", isAuth, swapController.getById);
router.post("/:postId", isAuth, swapController.Offer);

module.exports = router;
