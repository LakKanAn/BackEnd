const { firestore } = require("../../db/db");
const userModel = require("../models/users");
const bookModel = require("../models/books");
const statsModel = require("../models/stats");
const tradeModel = require("../models/trade");
const { validationResult } = require("express-validator");
const minioService = require("../services/minio");
const dayjs = require("dayjs");

exports.getAll = async (req, res, next) => {
  try {
    const perPage = parseInt(req.query.perpage) || 9;
    const currentPage = req.query.page - 1 || 0;
    const stats = await statsModel.getStatsOffer();
    let totalPage = Math.ceil(stats.totalOffers / perPage);
    let books = [];
    let bookImages = [];
    const snapshop = await tradeModel.getAll(perPage, currentPage);
    snapshop.forEach((doc) => {
      let data = doc.data();
      books.push({ ...data });
    });
    let bookDetail = [];
    for (let i = 0; i < books.length; i++) {
      let book = await bookModel.getBookById(books[i].owner_bookId);
      let bookImage = await minioService.getCoverBook(book.bookImage);
      bookImages.push(bookImage);
      bookDetail.push(book);
    }
    for (let i = 0; i < books.length; i++) {
      const buffer = bookDetail[i];
      buffer.bookImage = bookImages[i];
    }
    res.status(200).json({
      status: 200,
      books: bookDetail,
      config: {
        currentPage: currentPage + 1,
        perPage: parseInt(req.query.perpage) || perPage,
        totalPage: totalPage,
      },
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
    const offerId = req.params.offerId;
    const tradeDetail = await tradeModel.getById(offerId);
    if (tradeDetail.empty) {
      return res.status(404).json({ status: 404, msg: "Don't have any book" });
    } else {
      const ownerData = await userModel.getById(tradeDetail.owner_userId);
      let ownerDetails = {
        name: ownerData.displayName,
        email: ownerData.email,
      };
      const book = await bookModel.getBookById(tradeDetail.owner_bookId);
      const coverBook = await minioService.getCoverBook(book.bookImage);
      book.bookImage = coverBook;
      res.status(200).json({
        status: 200,
        ownerDetails: ownerDetails,
        tradeDetail: tradeDetail.timeSet + "day",
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
    await tradeModel.postBook(userId, bookId, data);
    return res.status(200).json({ msg: "this book is now post to exchange!" });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 404;
    }
    next(error);
  }
};

exports.Offer = async (req, res, next) => {
  try {
    const userId = req.userId;
    const offerId = req.params.offerId;
    const bookId = req.body.bookId;
    const checkOwner = await userModel.getBookById(userId, bookId);
    const tradeDetail = await tradeModel.getById(offerId);
    if (checkOwner.empty) {
      return res.status(404).json({ msg: "permission denied" });
    }
    if (tradeDetail.owner_userId == userId) {
      return res.status(200).json({ msg: "you can't not exchange your book" });
    } else {
      const offerData = await userModel.getById(userId);
      const offers = {
        [userId]: {
          displayName: offerData.displayName,
          offer_bookId: bookId,
        },
      };
      let data = {};
      data.offers = offers;
      await tradeModel.postOffer(offerId, data);
      return res
        .status(200)
        .json({ status: 200, msg: "offer added successfully" });
    }

    // const ownerBook = await userModel.getBookAll()
    // const timeSet = parseInt(req.body.timeSet);
    // const timeLimit = dayjs().add(timeSet, "day").toDate();
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 404;
    }
    next(error);
  }
};
