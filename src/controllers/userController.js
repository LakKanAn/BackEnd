const { firestore } = require("../../db/db");
const userModel = require("../models/users");

exports.registration = async (req, res, next) => {
  try {
    const userId = req.body.userId;
    const displayName = req.body.displayName;
    const email = req.body.email;
    data = {};
    data.email = email;
    data.displayName = displayName;
    const registration = await userModel.registration(userId, data);
    res.status(201).json({
      status: 200,
      user: registration,
    });
  } catch (error) {
    console.log(error);
    if (!error.statusCode) {
      error.statusCode = 404;
    }
    next(error);
  }
};

exports.me = async (req, res, next) => {
  try {
    const userId = req.userId;
    const userInfo = await userModel.getById(userId);
    res.status(201).json({
      status: 200,
      user: userInfo,
    });
  } catch (error) {
    console.log(error);
    if (!error.statusCode) {
      error.statusCode = 404;
    }
    next(error);
  }
};
