const { firestore, db } = require("../../db/db");
const distributorModel = require("../models/distributor");

exports.getAll = async (req, res, next) => {
  try {
    const distributorId = req.userId;
    const getAll = await distributorModel.getBookAll(distributorId);
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
    const bookTitle = req.body.bookTitle;
    const author = req.body.author;
    const Category = req.body.Category;
    const description = req.body.description;
    const price = req.body.price;
    const fileUrl = req.body.fileUrl;
    data = {};
    data.bookTitle = bookTitle;
    data.author = author;
    data.Category = Category;
    data.description = description;
    data.price = price;
    data.release = false;
    data.createAt = firestore.FieldValue.serverTimestamp();
    data.fileUrl = "https://www.googleapis.com/books/";
    const addBook = await distributorModel.createBook(distributorId, data);
    res.status(201).json({
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
  try {
    const distributorId = req.userId;
    const bookId = req.params.bookId;
    const book = await distributorModel.getBookById(distributorId, bookId);
    res.status(201).json({
      status: 200,
      BookDetails: book,
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 404;
    }
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const distributorId = req.userId;
    const bookId = req.params.bookId;
    const book = await distributorModel.updateBook(
      distributorId,
      bookId,
      req.body
    );
    res.status(201).json({
      status: 200,
      BookDetails: book,
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 404;
    }
    next(error);
  }
};

exports.delete = async (req, res, next) => {
  try {
    const distributorId = req.userId;
    const bookId = req.params.bookId;
    const book = await distributorModel.deleteBook(distributorId, bookId);
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
