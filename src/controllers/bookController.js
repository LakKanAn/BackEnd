const { firestore } = require("../../db/db");
const distributorModel = require("../models/distributor");

exports.getAll = async (req, res, next) => {
  try {
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
exports.create = async (req, res, next) => {
  try {
    const distributorId = req.body.distributorId;
    const bookTitle = req.body.bookTitle;
    const author = req.body.author;
    const Publisher = req.body.Publisher;
    const Category = req.body.Category;
    const description = req.body.description;
    const price = req.body.price;
    data = {};
    data.bookTitle = bookTitle;
    data.author = author;
    data.Publisher = Publisher;
    data.Category = Category;
    data.description = description;
    data.price = price;
    const addBook = await distributorModel.createBook(distributorId, data);
    res.status(201).json({
      status: 200,
      book: addBook,
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 404;
    }
    next(error);
  }
};
