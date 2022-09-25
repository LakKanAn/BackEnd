const { firestore, admin } = require("../../db/db");
const distributorModel = require("../models/distributor");
const bookModel = require("../models/books");
var validator = require("email-validator");
const adminUid = process.env.ADMIN_UID;
exports.addDistributor = async (req, res, next) => {
  try {
    const userId = req.userId;
    if (userId != adminUid) {
      return res.status(403).json({ status: 403, msg: "not a permission" });
    }
    const email = req.body.email;
    const password = req.body.password;
    if (!(email && password)) {
      return res
        .status(400)
        .json({ status: 400, msg: "Please enter a email and password" });
    }
    const checkEmail = validator.validate(email);
    switch (checkEmail) {
      case true:
        await admin
          .auth()
          .createUser({ email, password })
          .then(() => {
            return res.status(200).json({
              status: 200,
              msg: "Created successfully",
              distributor: { email, password },
            });
          })
          .catch((error) => {
            return res.status(400).json({ status: 400, msg: error.message });
          });
        break;
      case false:
        return res
          .status(400)
          .json({ status: 400, msg: "Email pattern not valid" });
    }
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 404;
    }
    next(error);
  }
};
