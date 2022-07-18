const { admin, firestore } = require("../../db/db");
const bookModel = require("../models/books");
const nodemailer = require("nodemailer");
const { nanoid } = require("nanoid");
const { validationResult } = require("express-validator");
const minioService = require("../services/minio");
const userModel = require("../models/users");
const transactionModel = require("../models/transactions");
const GMAIL = process.env.GMAIL_EMAIL;
const PASSWORD = process.env.GMAIL_PASSWORD;
exports.getAll = async (req, res, next) => {
  try {
    let books = [];
    let bookImages = [];
    const snapshop = await bookModel.getBookAll();
    snapshop.forEach((doc) => {
      let data = doc.data();
      books.push({ ...data, id: doc.id });
    });
    for (let i = 0; i < books.length; i++) {
      bookImages.push(await minioService.getCoverBook(books[i].bookImage));
    }
    for (let i = 0; i < books.length; i++) {
      const buffer = books[i];
      buffer.bookImage = bookImages[i];
    }
    res.status(200).json({
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
exports.getCoverBookImages = async (req, res, next) => {
  try {
    const bookId = req.params.bookId;
    const book = await bookModel.getBookById(bookId);
    const coverBook = await minioService.getCoverBook(book.bookImage);
    res.status(200).json({ status: 200, coverBook });
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
      res.status(404).json({ status: 404, msg: "Don't have any book" });
    } else if (book.release === false) {
      res.status(404).json({ status: 404, msg: "Don't have any book" });
    } else {
      const coverBook = await minioService.getCoverBook(book.bookImage);
      book.bookImage = coverBook;
      res.status(200).json({
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
