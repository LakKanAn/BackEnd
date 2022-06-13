const express = require("express");
const router = express.Router();
const siteController = require("../controllers/siteController");

router.post("/access_token", siteController.access_token);
router.get("/me", siteController.me);
router.get("/bye", siteController.bye);

module.exports = router;
