const { firestore } = require("../../db/db");
const userModel = require("../models/users");

exports.create = async (req, res, next) => {
  try {
    const name = req.body.name;
    const gender = req.body.gender;
    data = {};
    data.name = name;
    data.gender = gender;
    const registration = await userModel.createUser(data);
    res.status(201).json({
      status: 200,
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 404;
    }
    next(error);
  }
};
