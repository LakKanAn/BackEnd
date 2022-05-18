const { firestore } = require("../../db/db");
const distributorModel = require("../models/distributor");
const bookModel = require("../models/books");

exports.checkDistributor = async (req, res, next) => {
  try {
    const email = req.body.email;
    const checkDistributor = await distributorModel.checkDistributor(email);
    if (checkDistributor.empty) {
      res.status(404).json({ status: 404, hasDistributor: false });
    } else {
      res.status(200).json({ status: 200, hasDistributor: true });
    }
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
    const bookTitle = req.body.bookTitle;
    const author = req.body.author;
    const Category = req.body.Category;
    const description = req.body.description;
    const price = req.body.price;
    // const fileUrl = req.body.fileUrl;
    data = {};
    data.distributorId = distributorId;
    data.bookTitle = bookTitle;
    data.author = author;
    data.Category = Category;
    data.description = description;
    data.price = price;
    data.release = false;
    data.createAt = firestore.FieldValue.serverTimestamp();
    data.fileUrl = "https://www.googleapis.com/books/";
    const addBook = await bookModel.createBook(distributorId, data);
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
  try {
    const distributorId = req.userId;
    const bookId = req.params.bookId;
    const book = await bookModel.deleteBook(distributorId, bookId);
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
