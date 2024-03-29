const userModel = require("../models/users");
const bookModel = require("../models/books");
const tradeModel = require("../models/trade");
const transactionModel = require("../models/transactions");
const minioService = require("../services/minio");
const dayjs = require("dayjs");
const { nanoid } = require("nanoid");
const { firestore } = require("../../db/db");

exports.getAll = async (req, res, next) => {
  try {
    let books = [];
    let bookImages = [];
    const snapshot = await tradeModel.getAll();
    snapshot.forEach((doc) => {
      let data = doc.data();
      books.push({ ...data });
    });
    let bookDetail = [];
    for (let i = 0; i < books.length; i++) {
      let book = await bookModel.getBookById(books[i].owner_bookId);
      let bookImage = await minioService.getCoverBook(book.bookImage);
      bookImages.push(bookImage);
      book.postId = books[i].postId;
      book.ownerName = books[i].owner_userName;
      book.during = books[i].timeSet;
      bookDetail.push(book);
    }
    for (let i = 0; i < books.length; i++) {
      const buffer = bookDetail[i];
      buffer.bookImage = bookImages[i];
    }
    res.status(200).json({
      status: 200,
      books: bookDetail,
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
    let offerDetails = [];
    const offers = Object.keys(postDetail.offers);
    if (offers.length > 0) {
      for (const [key, value] of Object.entries(postDetail.offers)) {
        const book = await bookModel.getBookById(value.offer_bookId);
        const coverBook = await minioService.getCoverBook(book.bookImage);
        book.bookImage = coverBook;
        const offer = { offerId: key, name: value.displayName, book: book };
        offerDetails.push(offer);
      }
      return res.status(200).json({
        status: 200,
        ownerDetails: ownerDetails,
        postDetail: postDetail.timeSet,
        BookDetails: book,
        offerDetails: offerDetails,
      });
    } else {
      return res.status(200).json({
        status: 200,
        ownerDetails: ownerDetails,
        postDetail: postDetail.timeSet,
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
    const userData = await userModel.getById(userId);
    if (checkBook.post == true) {
      return res
        .status(404)
        .json({ status: 404, msg: "This book has already post to exchange" });
    } else if (checkBook.exchange == true) {
      return res
        .status(404)
        .json({ status: 404, msg: "This book has already exchange" });
    } else if (timeSet <= 0) {
      return res.status(406).json({ status: 406, msg: "time is not set" });
    }

    let data = {};
    data.timeSet = timeSet;
    data.owner_bookId = bookId;
    data.owner_userId = userId;
    data.owner_userName = userData.displayName;
    data.offers = {};
    await tradeModel.postBook(userId, bookId, data);
    return res
      .status(200)
      .json({ status: 200, msg: "This book is now posted to exchange!" });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 404;
    }
    next(error);
  }
};

exports.cancel = async (req, res, next) => {
  try {
    const userId = req.userId;
    const postId = req.params.postId;
    const postDetail = await tradeModel.getById(postId);
    if (postDetail == undefined) {
      return res
        .status(404)
        .json({ status: 404, msg: "This post is not available " });
    }
    const checkBook = await userModel.getBookById(
      userId,
      postDetail.owner_bookId
    );
    if (checkBook.post == false) {
      return res
        .status(404)
        .json({ status: 404, msg: "This book is not posted for exchange." });
    }

    await tradeModel.cancelPostBook(userId, postDetail.owner_bookId, postId);
    return res.status(200).json({
      status: 200,
      msg: "This book is canceled the posted to exchange!",
    });
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
      return res.status(404).json({ status: 404, msg: "Permission Denied" });
    } else if (checkOwner.exchange == true) {
      return res
        .status(406)
        .json({ status: 406, msg: "This book already exchange" });
    }
    if (postDetail == undefined) {
      return res.status(404).json({ status: 404, msg: "Don't have any post" });
    }
    if (postDetail.owner_userId == userId) {
      return res
        .status(200)
        .json({ status: 200, msg: "You can't not exchange your book" });
    }
    let offerData = {};
    for (const [value] of Object.entries(postDetail.offers)) {
      offerData.BookId = value["offer_bookId"];
      offerData.userId = value["userId"];
    }
    if (offerData.BookId == bookId && offerData.userId == userId) {
      return res.status(200).json({
        status: 200,
        msg: "You already offer this book for this post",
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
        .json({ status: 200, msg: "Offer added successfully" });
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
    if (postDetails === undefined) {
      return res
        .status(404)
        .json({ status: 404, msg: "This post is already confirm" });
    }
    const during = dayjs().add(postDetails.timeSet, "Day").toDate();
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
    let data = {};
    data.postId = postId;
    data.offerData = offerData;
    data.ownerUserId = ownerUserId;
    data.offerUserId = offerUserId;
    data.ownerBookId = ownerBookId;
    data.offerBookId = offerBookId;
    data.date = firestore.FieldValue.serverTimestamp();
    data.type = "exchanging";
    data.status = "successful";
    const getCheckPostOfoffer = await tradeModel.getOfferPost(
      offerUserId,
      offerBookId
    );
    if (getCheckPostOfoffer.size > 0) {
      const post = [];
      getCheckPostOfoffer.forEach((doc) => {
        let data = doc.data();
        post.push({ ...data });
      });
      await tradeModel.deletePost(post[0].postId);
    }
    await transactionModel.create(data);
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
