const { firestore } = require("../../db/db");
const distributorModel = require("../models/distributor");

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
exports.registration = async (req, res, next) => {
  try {
    const distributorId = req.body.distributorId;
    const email = req.body.email;
    data = {};
    data.email = email;
    const registration = await distributorModel.registration(
      distributorId,
      data
    );
    res.status(201).json({
      status: 200,
      msg: "Registration successful",
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 404;
    }
    next(error);
  }
};
