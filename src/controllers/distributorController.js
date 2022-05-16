const { firestore } = require("../../db/db");
const distributorModel = require("../models/distributor");

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
