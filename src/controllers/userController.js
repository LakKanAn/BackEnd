const { firestore } = require("../../db/db");
const userModel = require("../models/users");
const bookModel = require("../models/books");
const tradeModel = require("../models/trade");
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
      bookshelf.push({ ...data });
    });
    let bookDetail = [];
    for (let i = 0; i < bookshelf.length; i++) {
      let book = await bookModel.getBookById(bookshelf[i].bookId);
      let bookImage = await minioService.getCoverBook(book.bookImage);
      bookImages.push(bookImage);
      bookDetail.push(book);
    }
    for (let i = 0; i < bookshelf.length; i++) {
      const buffer = bookDetail[i];
      buffer.bookImage = bookImages[i];
    }
    res.status(200).json({ status: 200, bookDetail });
  } catch (error) {
    console.log(error);
    if (!error.statusCode) {
      error.statusCode = 404;
    }
    next(error);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const userId = req.userId;
    const bookId = req.params.bookId;
    const bookshelf = await userModel.getBookById(userId, bookId);
    if (bookshelf === undefined) {
      return res.status(404).json({ status: 404, msg: "Don't have any book" });
    } else {
      const book = await bookModel.getBookById(bookshelf.bookId);
      const coverBook = await minioService.getCoverBook(book.bookImage);
      if (bookshelf.exchange == false) {
        const filename = book.bookImage.split(".jpg")[0];
        const contentBook = await minioService.getContentBook(
          filename + ".pdf"
        );
        book.bookImage = coverBook;
        book.contentBook = contentBook;
        return res.status(200).json({
          status: 200,
          BookDetails: book,
        });
      }
      book.bookImage = coverBook;
      book.contentBook = "this book has already trade-in time ";
      return res.status(200).json({
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

exports.getAllPost = async (req, res, next) => {
  try {
    const userId = req.userId;
    let bookshelf = [];
    let bookImages = [];
    const snapshop = await userModel.getBookPostAll(userId);
    snapshop.forEach((doc) => {
      let data = doc.data();
      bookshelf.push({ ...data });
    });
    let bookDetail = [];
    for (let i = 0; i < bookshelf.length; i++) {
      let book = await bookModel.getBookById(bookshelf[i].bookId);
      let bookImage = await minioService.getCoverBook(book.bookImage);
      bookImages.push(bookImage);
      bookDetail.push(book);
    }
    for (let i = 0; i < bookshelf.length; i++) {
      const buffer = bookDetail[i];
      buffer.bookImage = bookImages[i];
    }
    res.status(200).json({ status: 200, bookDetail });
  } catch (error) {
    console.log(error);
    if (!error.statusCode) {
      error.statusCode = 404;
    }
    next(error);
  }
};

exports.getByIdBookTrade = async (req, res, next) => {
  try {
    const userId = req.userId;
    const exchangeId = req.params.exchangeId;
    const bookTrade = await tradeModel.getBookTradeById(exchangeId);
    if (bookTrade.log[userId]) {
      const bookId = bookTrade.log[userId].bookId;
      const book = await bookModel.getBookById(bookId);
      const coverBook = await minioService.getCoverBook(book.bookImage);
      const filename = book.bookImage.split(".jpg")[0];
      const contentBook = await minioService.getContentBook(filename + ".pdf");
      book.bookImage = coverBook;
      book.contentBook = contentBook;
      return res.status(200).json({
        status: 200,
        BookDetails: book,
      });
    } else {
      return res.status(404).json({ msg: "permission denied" });
    }
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 404;
    }
    next(error);
  }
};
