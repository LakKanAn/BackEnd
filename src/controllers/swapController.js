const { firestore } = require("../../db/db");
const userModel = require("../models/users");
const bookModel = require("../models/books");
const exchangeModel = require("../models/exchange");
const { validationResult } = require("express-validator");
const minioService = require("../services/minio");
const dayjs = require("dayjs");

exports.post = async (req, res, next) => {
  try {
    const userId = req.userId;
    const bookId = req.params.bookId;
    const timeSet = parseInt(req.body.timeSet);
    // const timeLimit = dayjs().add(timeSet, "day").toDate();
    const checkBook = await userModel.getBookById(userId, bookId);
    if (checkBook.exchange == true) {
      return res
        .status(404)
        .json({ msg: "this book has already post to exchange" });
    }
    let data = {};
    data.timeSet = timeSet;
    data.owner_bookId = bookId;
    data.owner_userId = userId;
    await userModel.postBook(userId, bookId);
    await exchangeModel.addOffer(data);
    return res.status(200).json({ msg: "this book is now post to exchange!" });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 404;
    }
    next(error);
  }
};
