const { firestore } = require("../../db/db");
const distributorModel = require("../models/distributor");

// exports.getAll = async (req, res, next) => {
//   try {
//     res.status(201).json({
//       status: 200,
//     });
//   } catch (error) {
//     if (!error.statusCode) {
//       error.statusCode = 404;
//     }
//     next(error);
//   }
// };
exports.registration = async (req, res, next) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    data = {};
    data.email = email;
    data.password = password;
    const registration = await distributorModel.registration(data);
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
