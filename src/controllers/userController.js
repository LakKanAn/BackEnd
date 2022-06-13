const { firestore } = require("../../db/db");
const userModel = require("../models/users");
const { validationResult } = require("express-validator");
const minioService = require("../services/minio");
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
      data.role = "user";
      data.joinAt = joinAt;
      await userModel.registration(userId, data);
      res.status(404).json({ status: 404, hasUser: false });
    } else {
      const getUser = await userModel.getById(userId);
      res.status(201).json({ status: 201, hasUser: true, getUser });
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
    let bookshelf = [];
    let bookImages = [];
    const snapshop = await userModel.getBookAll(userId);
    snapshop.forEach((doc) => {
      let data = doc.data();
      bookshelf.push({ ...data, id: doc.id });
    });
    for (let i = 0; i < bookshelf.length; i++) {
      bookImages.push(await minioService.getCoverBook(bookshelf[i].bookImage));
    }
    for (let i = 0; i < bookshelf.length; i++) {
      const buffer = bookshelf[i];
      buffer.bookImage = bookImages[i];
    }
    res.status(200).json({ status: 200, bookshelf });
  } catch (error) {
    console.log(error);
    if (!error.statusCode) {
      error.statusCode = 404;
    }
    next(error);
  }
};
