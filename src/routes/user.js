var express = require("express");
var router = express.Router();
// const isAuth = require("../middleware/auth");

//loading Controller
const userController = require("../controllers/userController");

// route to controller
// router.get("/", isAuth, memberController.getAll);
// router.get("/", userController.getAll);
router.post("/register", userController.create);
// router.get("/:uid", userController.getById);
// router.put("/:uid", userController.updateById);
// router.delete("/:uid", userController.deleteById);

module.exports = router;
