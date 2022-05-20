const { firestore } = require("../../db/db");
const userModel = require("../models/users");

exports.registration = async (req, res, next) => {
  try {
    const email = req.body.email;
    const userId = req.body.userId;
    const checkUser = await userModel.checkUser(email);
    if (checkUser.empty) {
      const displayName = req.body.displayName;
      const joinAt = firestore.FieldValue.serverTimestamp();
      const data = {};
      data.email = email;
      data.displayName = displayName;
      data.email = email;
      data.joinAt = joinAt;
      await userModel.registration(userId, data);
      res.status(404).json({ status: 404, hasUser: false });
    } else {
      const getUser = await userModel.getById(userId);
      res.status(200).json({ status: 200, hasUser: true, getUser });
    }
  } catch (error) {
    console.log(error);
    if (!error.statusCode) {
      error.statusCode = 404;
    }
    next(error);
  }
};
