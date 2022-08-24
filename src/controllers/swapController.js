const { firestore } = require("../../db/db");
const userModel = require("../models/users");
const bookModel = require("../models/books");
const statsModel = require("../models/stats");
const tradeModel = require("../models/trade");
const { validationResult } = require("express-validator");
const minioService = require("../services/minio");
const dayjs = require("dayjs");
const { nanoid } = require("nanoid");

exports.getAll = async (req, res, next) => {
  try {
    const perPage = parseInt(req.query.perpage) || 9;
    const currentPage = req.query.page - 1 || 0;
    const stats = await statsModel.getStatsTrade();
    let totalPage = Math.ceil(stats.totalPosts / perPage);
    let books = [];
    let bookImages = [];
    const snapshop = await tradeModel.getAll(perPage, currentPage);
    snapshop.forEach((doc) => {
      let data = doc.data();
      books.push({ ...data });
    });
    let bookDetail = [];
    for (let i = 0; i < books.length; i++) {
      let postId = books[i].postId;
      let book = await bookModel.getBookById(books[i].owner_bookId);
      let bookImage = await minioService.getCoverBook(book.bookImage);
      bookImages.push(bookImage);
      book.postId = postId;
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
    let booksAndUserName = [];
    const offerDetails = Object.values(postDetail.offers);
    if (offerDetails.length > 0) {
      for (let i = 0; i < offerDetails.length; i++) {
        booksAndUserName.push(
          await bookModel.getBookById(offerDetails[i].offer_bookId)
        );
        booksAndUserName.push(offerDetails[i].displayName);
      }
      return res.status(200).json({
        status: 200,
        ownerDetails: ownerDetails,
        postDetail: postDetail.timeSet + "day",
        BookDetails: book,
        offerDetails: booksAndUserName,
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

exports.post = async (req, res, next) => {
  try {
    const userId = req.userId;
    const bookId = req.params.bookId;
    const timeSet = parseInt(req.body.timeSet);
    const checkBook = await userModel.getBookById(userId, bookId);
    if (checkBook.post == true) {
      return res
        .status(404)
        .json({ msg: "this book has already post to exchange" });
    }
    let data = {};
    data.timeSet = timeSet;
    data.owner_bookId = bookId;
    data.owner_userId = userId;
    data.offers = {};
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
    const postId = req.params.postId;
    const bookId = req.body.bookId;
    const offerId = nanoid();
    const checkOwner = await userModel.getBookById(userId, bookId);
    const postDetail = await tradeModel.getById(postId);
    if (checkOwner == undefined) {
      return res.status(404).json({ msg: "permission denied" });
    }
    if (postDetail == undefined) {
      return res.status(404).json({ status: 404, msg: "Don't have any post" });
    }
    if (postDetail.owner_userId == userId) {
      return res.status(200).json({ msg: "you can't not exchange your book" });
    }
    let offerData = {};
    for (const [key, value] of Object.entries(postDetail.offers)) {
      offerData.BookId = value["offer_bookId"];
      offerData.userId = value["userId"];
    }
    if (offerData.BookId == bookId && offerData.userId == userId) {
      return res.status(200).json({
        status: 200,
        msg: "you already offer this book for this post",
      });
    } else {
      const offerData = await userModel.getById(userId);
      const offers = {
        [offerId]: {
          userId: offerData.userId,
          displayName: offerData.displayName,
          offer_bookId: bookId,
        },
      };
      let data = {};
      data.offers = offers;
      await tradeModel.postOffer(postId, data);
      return res
        .status(200)
        .json({ status: 200, msg: "offer added successfully" });
    }
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 404;
    }
    next(error);
  }
};
////ownerPost confirm
exports.confirm = async (req, res, next) => {
  try {
    const userId = req.userId;
    const postId = req.params.postId;
    const offerId = req.params.offerId;
    const postDetails = await tradeModel.getById(postId);
    const during = dayjs().add(postDetails.timeSet, "day").toDate();
    let offerData = {
      exchangeId: postId,
      during: during,
      log: {
        [userId]: {
          bookId: postDetails.offers[offerId].offer_bookId,
        },
        [postDetails.offers[offerId].userId]: {
          bookId: postDetails.owner_bookId,
        },
      },
    };
    const ownerUserId = userId;
    const offerUserId = postDetails.offers[offerId].userId;
    const ownerBookId = postDetails.owner_bookId;
    const offerBookId = postDetails.offers[offerId].offer_bookId;
    await tradeModel.confirm(
      postId,
      offerData,
      ownerUserId,
      offerUserId,
      ownerBookId,
      offerBookId
    );
    await tradeModel.deletePost(postId);

    return res.status(200).json({ status: 200, offerData });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 404;
    }
    next(error);
  }
};

exports.During = async (req, res, next) => {
  try {
    const during = dayjs().toDate();
    const checkDuring = await tradeModel.checkDuring(during);
    let lists = [];
    checkDuring.forEach((doc) => {
      let data = doc.data();
      lists.push({ ...data });
    });
    if (lists.length == 0) {
      return res.status(200).json({ status: 200, msg: "noting to update" });
    }

    let logData = [];
    for (const [key, value] of Object.entries(lists[0].log)) {
      logData.push({ userId: key, bookId: value.bookId });
    }
    for (let i = 0; i < logData.length; i++) {
      const userId = logData[i].userId;
      const bookId = logData[i].bookId;
      await tradeModel.rollback(userId, bookId);
    }
    await tradeModel.deleteExchange(lists[0].exchangeId);
    return res.status(200).json({ status: 200, msg: "update successfully" });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 404;
    }
    next(error);
  }
};

exports.notifyOffer = async (req, res, next) => {};

exports.notifyConfirm = async (req, res, next) => {};
