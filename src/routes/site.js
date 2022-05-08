const express = require("express");
const router = express.Router();

const siteController = require("../controllers/siteController");
// const isAuth = require("../middleware/auth");

// router.post("/auth", siteController.auth);
router.post("/access_token", siteController.access_token);
router.get("/me", siteController.me);
router.post("/bye", siteController.bye);

module.exports = router;
