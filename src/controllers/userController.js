const { firestore } = require("../../db/db");
const userModel = require("../models/users");
const { validationResult } = require("express-validator");

exports.registration = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ status: 400, error: errors.array() });
  }
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

exports.getAllBooks = async (req, res, next) => {
  try {
    const userId = req.userId;
    const getAll = await userModel.getBookAll(userId);
    const bookshelf = getAll.docs.map((doc) => doc.data());
    res.status(200).json({ status: 200, bookshelf });
  } catch (error) {
    console.log(error);
    if (!error.statusCode) {
      error.statusCode = 404;
    }
    next(error);
  }
};
