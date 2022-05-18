const { firestore } = require("../../db/db");
const userModel = require("../models/users");

exports.registration = async (req, res, next) => {
  try {
    const userId = req.body.userId;
    const displayName = req.body.displayName;
    const email = req.body.email;
    const joinAt = firestore.FieldValue.serverTimestamp();
    const data = {};
    data.email = email;
    data.displayName = displayName;
    data.joinAt = joinAt;
    gender;
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

exports.update = async (req, res, next) => {
  try {
    const userId = req.userId;
    const getById = await userModel.getById(userId);

    const userInfo = await userModel.updateUser(userId);
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
