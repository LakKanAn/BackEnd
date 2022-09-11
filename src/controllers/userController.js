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

//// page bookshelf
exports.getAllBooks = async (req, res, next) => {
  try {
    const perPage = parseInt(req.query.perpage) || 9;
    const currentPage = req.query.page - 1 || 0;
    const userId = req.userId;
    let bookshelf = [];
    let bookImages = [];
    const snapshot = await userModel.getBookAll(userId, perPage, currentPage);
    snapshot.forEach((doc) => {
      let data = doc.data();
      bookshelf.push({ ...data });
    });
    const countDoc = snapshot.size;
    let totalPage = Math.ceil(countDoc / perPage);
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
    res.status(200).json({
      status: 200,
      bookDetail,
      config: {
        currentPage: currentPage + 1,
        perPage: parseInt(req.query.perpage) || perPage,
        totalPage: totalPage,
      },
    });
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

//// page Post

exports.getAllPost = async (req, res, next) => {
  try {
    const perPage = parseInt(req.query.perpage) || 9;
    const currentPage = req.query.page - 1 || 0;
    const userId = req.userId;
    let bookPost = [];
    let bookImages = [];
    const snapshot = await tradeModel.getOwnPostAll(
      userId,
      perPage,
      currentPage
    );
    snapshot.forEach((doc) => {
      let data = doc.data();
      bookPost.push({ ...data });
    });
    const countDoc = snapshot.size;
    let totalPage = Math.ceil(countDoc / perPage);
    let bookDetail = [];
    for (let i = 0; i < bookPost.length; i++) {
      let books = await bookModel.getBookById(bookPost[i].owner_bookId);
      let bookImage = await minioService.getCoverBook(books.bookImage);
      books.postId = bookPost[i].postId;
      bookImages.push(bookImage);
      bookDetail.push(books);
    }
    for (let i = 0; i < bookPost.length; i++) {
      const buffer = bookDetail[i];
      buffer.bookImage = bookImages[i];
    }
    res.status(200).json({
      status: 200,
      bookDetail,
      config: {
        currentPage: currentPage + 1,
        perPage: parseInt(req.query.perpage) || perPage,
        totalPage: totalPage,
      },
    });
  } catch (error) {
    console.log(error);
    if (!error.statusCode) {
      error.statusCode = 404;
    }
    next(error);
  }
};
exports.getPostById = async (req, res, next) => {
  try {
    const userId = req.userId;
    const postId = req.params.postId;
    const postDetail = await tradeModel.getById(postId);
    if (postDetail == undefined) {
      return res.status(404).json({ status: 404, msg: "Don't have any post" });
    }
    const ownerData = await userModel.getById(postDetail.owner_userId);
    let ownerDetails = {
      name: ownerData.displayName,
      email: ownerData.email,
    };
    const book = await bookModel.getBookById(postDetail.owner_bookId);
    const coverBook = await minioService.getCoverBook(book.bookImage);
    book.bookImage = coverBook;
    let offerDetails = [];
    const offers = Object.keys(postDetail.offers);
    if (offers.length > 0) {
      for (const [key, value] of Object.entries(postDetail.offers)) {
        const book = await bookModel.getBookById(value.offer_bookId);
        const offer = { offerId: key, name: value.displayName, book: book };
        offerDetails.push(offer);
      }
      return res.status(200).json({
        status: 200,
        ownerDetails: ownerDetails,
        postDetail: postDetail.timeSet + "  " + "Day",
        BookDetails: book,
        offerDetails: offerDetails,
      });
    } else {
      return res.status(200).json({
        status: 200,
        ownerDetails: ownerDetails,
        postDetail: postDetail.timeSet + "day",
        BookDetails: book,
        offerDetails: "Don't have any offers",
      });
    }
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 404;
    }
    next(error);
  }
};

//// page Trade

exports.getAllTrade = async (req, res, next) => {
  try {
    const userId = req.userId;
    const perPage = parseInt(req.query.perpage) || 9;
    const currentPage = req.query.page - 1 || 0;
    let bookTrade = [];
    let bookImages = [];
    const snapshot = await tradeModel.getBookTradeAll(perPage, currentPage);
    snapshot.forEach((doc) => {
      let data = doc.data();
      bookTrade.push({ ...data });
    });
    const countDoc = snapshot.size;
    let totalPage = Math.ceil(countDoc / perPage);
    let bookDetail = [];
    for (let i = 0; i < bookTrade.length; i++) {
      let log = bookTrade[i].log[userId];
      let book = await bookModel.getBookById(log.bookId);
      let bookImage = await minioService.getCoverBook(book.bookImage);
      bookImages.push(bookImage);
      bookDetail.push(book);
    }

    for (let i = 0; i < bookTrade.length; i++) {
      const exchangeId = bookTrade[i].exchangeId;
      const buffer = bookDetail[i];
      buffer.bookImage = bookImages[i];
      buffer.exchangeId = exchangeId;
    }
    res.status(200).json({
      status: 200,
      bookDetail,
      config: {
        currentPage: currentPage + 1,
        perPage: parseInt(req.query.perpage) || perPage,
        totalPage: totalPage,
      },
    });
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
    if (bookTrade == undefined) {
      return res.status(404).json({ status: 404, msg: "during is time out" });
    }
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
