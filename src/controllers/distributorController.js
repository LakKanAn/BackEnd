const { firestore } = require("../../db/db");
const distributorModel = require("../models/distributor");
const bookModel = require("../models/books");
const minioService = require("../services/minio");
const { validationResult } = require("express-validator");

exports.registration = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ status: 400, error: errors.array() });
  }
  try {
    const distributorId = req.body.distributorId;
    const email = req.body.email;
    const checkUser = await distributorModel.checkDistributor(email);
    if (checkUser.empty) {
      const joinAt = firestore.FieldValue.serverTimestamp();
      const data = {};
      data.email = email;
      data.role = "distributor";
      await userModel.registration(userId, data);
      res.status(404).json({ status: 404, hasUser: false });
    } else {
      const getDistributor = await distributorModel.getById(distributorId);
      res.status(201).json({ status: 201, hasUser: true, getDistributor });
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

exports.create = async (req, res, next) => {
  try {
    const distributorId = req.userId;
    const checkDistributor = await distributorModel.getById(distributorId);
    if (checkDistributor == undefined) {
      return res.status(403).json({ status: 403, msg: "not a permission" });
    }
    const { bookTitle, author, category, description, price, genre } = req.body;
    if (!(bookTitle, author, category, description, price, genre)) {
      return res
        .status(400)
        .json({ status: 400, msg: "Please input item information!" });
    }
    // const fileUrl = req.body.fileUrl;
    data = {};
    data.distributorId = distributorId;
    data.bookTitle = bookTitle;
    data.author = author;
    data.category = category;
    data.genre = genre;
    data.description = description;
    data.price = price;
    data.release = false;
    data.createAt = firestore.FieldValue.serverTimestamp();
    data.fileUrl = "https://www.googleapis.com/books/";
    const createBook = await bookModel.createBook(data);
    const bookId = createBook.bookId;
    res.status(200).json({
      status: 200,
      newBook: data,
      bookId,
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 404;
    }
    next(error);
  }
};

exports.addFile = async (req, res, next) => {
  try {
    const distributorId = req.userId;
    const checkDistributor = await distributorModel.getById(distributorId);
    if (checkDistributor == undefined) {
      return res.status(403).json({ status: 403, msg: "not a permission" });
    }
    const keyName = Object.keys(req.files)[0];
    const file = req.files[keyName][0];
    const bookId = req.params.bookId;
    const contenType = file.mimetype;
    const originalname = file.originalname;
    const buffer = file.buffer;
    if (file.fieldname == "image") {
      data = {};
      data.bookImage = originalname;
      await minioService.uploadFileImasge(contenType, originalname, buffer);
      const bookImage = await minioService.getCoverBook(originalname);
      await bookModel.updateBook(bookId, data);
      res.status(201).send({
        status: 201,
        imageName: file.originalname,
        url: bookImage,
      });
    } else if (file.fieldname == "content") {
      await minioService.uploadFileContent(contenType, originalname, buffer);
      const bookContent = await minioService.getContentBook(originalname);
      res.status(201).send({
        status: 201,
        imageName: file.originalname,
        url: bookContent,
      });
    }
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
    const distributorId = req.userId;
    const checkDistributor = await distributorModel.getById(distributorId);
    if (checkDistributor == undefined) {
      return res.status(403).json({ status: 403, msg: "not a permission" });
    }
    const bookId = req.params.bookId;
    const book = await bookModel.getBookById(bookId);
    // const bookImage = book.bookImage;
    const bookImage = await minioService.getCoverBook(book.bookImage);
    if (!book) {
      res.status(404).json({ status: 404, msg: "Don'y have any book" });
    } else {
      res.status(200).json({
        status: 200,
        BookDetails: book,
        bookImage,
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
    const distributorId = req.userId;
    const checkDistributor = await distributorModel.getById(distributorId);
    if (checkDistributor == undefined) {
      return res.status(403).json({ status: 403, msg: "not a permission" });
    }
    const bookId = req.params.bookId;
    const book = await bookModel.getBookById(bookId);
    if (!book) {
      res.status(404).json({ status: 404, msg: "Don'y have any book" });
    } else {
      await bookModel.updateBook(bookId, req.body);
      res.status(202).json({
        status: 202,
        msg: "updateBook successful",
      });
    }
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
    const checkDistributor = await distributorModel.getById(distributorId);
    if (checkDistributor == undefined) {
      return res.status(403).json({ status: 403, msg: "not a permission" });
    }
    const bookId = req.params.bookId;
    const book = await bookModel.getBookById(bookId);
    if (!book) {
      res.status(404).json({ status: 404, msg: "Don'y have any book" });
    } else {
      await bookModel.deleteBook(distributorId, bookId);
      res.status(202).json({
        status: 202,
        msg: "Delete successful",
      });
    }
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 404;
    }
    next(error);
  }
};
