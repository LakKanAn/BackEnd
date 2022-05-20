const { firestore } = require("../../db/db");
const distributorModel = require("../models/distributor");
const bookModel = require("../models/books");
const { validationResult } = require("express-validator");

exports.registration = async (req, res, next) => {
  try {
    const distributorId = req.body.distributorId;
    const email = req.body.email;
    const checkUser = await userModel.checkUser(email);
    if (checkUser.empty) {
      const joinAt = firestore.FieldValue.serverTimestamp();
      const data = {};
      data.email = email;
      data.joinAt = joinAt;
      await userModel.registration(userId, data);
      res.status(404).json({ status: 404, hasUser: false });
    } else {
      const getDistributor = await distributorModel.getById(distributorId);
      res.status(200).json({ status: 200, hasUser: true, getDistributor });
    }
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 404;
    }
    next(error);
  }
};

exports.getAll = async (req, res, next) => {
  try {
    const distributorId = req.userId;
    const getAll = await bookModel.getBookAllByDistributor(distributorId);
    const books = getAll.docs.map((doc) => doc.data());
    res.status(201).json({
      status: 200,
      books: books,
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 404;
    }
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    const distributorId = req.userId;
    const { bookTitle, author, category, description, price } = req.body;
    if (!(bookTitle, author, category, description, price)) {
      return res
        .status(500)
        .json({ status: 500, msg: "Please input item information!" });
    }
    // const fileUrl = req.body.fileUrl;
    data = {};
    data.distributorId = distributorId;
    data.bookTitle = bookTitle;
    data.author = author;
    data.Category = category;
    data.description = description;
    data.price = price;
    data.release = false;
    data.createAt = firestore.FieldValue.serverTimestamp();
    data.fileUrl = "https://www.googleapis.com/books/";
    await bookModel.createBook(distributorId, data);
    res.status(200).json({
      status: 200,
      newBook: data,
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 404;
    }
    next(error);
  }
};
exports.getById = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ status: 400, error: errors.array() });
  }
  try {
    const bookId = req.params.bookId;
    const book = await bookModel.getBookById(bookId);
    if (!book) {
      res.status(404).json({ status: 404, msg: "Don'y have any book" });
    } else {
      res.status(201).json({
        status: 200,
        BookDetails: book,
      });
    }
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 404;
    }
    next(error);
  }
};
exports.update = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ status: 400, error: errors.array() });
  }
  try {
    const bookId = req.params.bookId;
    await bookModel.updateBook(bookId, req.body);
    res.status(201).json({
      status: 200,
      msg: "updateBook successful",
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 404;
    }
    next(error);
  }
};
exports.delete = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ status: 400, error: errors.array() });
  }
  try {
    const distributorId = req.userId;
    const bookId = req.params.bookId;
    await bookModel.deleteBook(distributorId, bookId);
    res.status(201).json({
      status: 200,
      msg: "Delete successful",
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 404;
    }
    next(error);
  }
};
