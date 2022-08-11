const { admin, firestore } = require("../../db/db");
const bookModel = require("../models/books");
const statsModel = require("../models/stats");
const { validationResult } = require("express-validator");
const minioService = require("../services/minio");

exports.getAll = async (req, res, next) => {
  try {
    const perPage = parseInt(req.query.perpage) || 40;
    const currentPage = req.query.page - 1 || 0;
    const stats = await statsModel.getStatsBook();
    let totalPage = Math.ceil(stats.totalBooks / perPage);
    let books = [];
    let bookImages = [];
    const snapshot = await bookModel.getBookAll(perPage, currentPage);
    snapshot.forEach((doc) => {
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

exports.getByCategoryAndGenre = async (req, res, next) => {
  try {
    const category = req.query.category;
    const genre = req.query.genre;
    const perPage = parseInt(req.query.perpage) || 40;
    const currentPage = req.query.page - 1 || 0;
    const separateGenre = genre.split("-");
    let books = [];
    let bookImages = [];
    if (genre && category) {
      const snapshotCategoryAndGenre = await bookModel.getByCategoryAndGenre(
        category,
        genre,
        perPage,
        currentPage
      );
      snapshotCategoryAndGenre.forEach((doc) => {
        let data = doc.data();
        books.push({ ...data, id: doc.id });
      });
    }

    if (genre === undefined) {
      const snapshotCategory = await bookModel.getByCategory(
        category,
        perPage,
        currentPage
      );
      snapshotCategory.forEach((doc) => {
        let data = doc.data();
        books.push({ ...data, id: doc.id });
      });
    }
    if (category === undefined) {
      const snapshotGenre = await bookModel.getByGenre(
        separateGenre,
        perPage,
        currentPage
      );
      snapshotGenre.forEach((doc) => {
        let data = doc.data();
        books.push({ ...data, id: doc.id });
      });
    }

    if (books.length === 0) {
      res.status(404).json({ status: 404, msg: "Don't have any book" });
    } else if (books.release === false) {
      res.status(404).json({ status: 404, msg: "Don't have any book" });
    } else {
      for (let i = 0; i < books.length; i++) {
        bookImages.push(await minioService.getCoverBook(books[i].bookImage));
      }
      for (let i = 0; i < books.length; i++) {
        const buffer = books[i];
        buffer.bookImage = bookImages[i];
      }
      res.status(200).json({
        status: 200,
        bookDetail: books,
        config: {
          currentPage: currentPage + 1,
          perPage: parseInt(req.query.perpage) || perPage,
        },
      });
    }
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 404;
    }
    next(error);
  }
};

exports.search = async (req, res, next) => {
  try {
    const bookTitle = req.query.bookTitle;
    const perPage = parseInt(req.query.perpage) || 40;
    const currentPage = req.query.page - 1 || 0;
    let books = [];
    let bookImages = [];
    const snapshotSearch = await bookModel.search(
      bookTitle,
      perPage,
      currentPage
    );
    snapshotSearch.forEach((doc) => {
      let data = doc.data();
      books.push({ ...data, id: doc.id });
    });
    if (books.length === 0) {
      res.status(404).json({ status: 404, msg: "Don't have any book" });
    } else if (books.release === false) {
      res.status(404).json({ status: 404, msg: "Don't have any book" });
    } else {
      for (let i = 0; i < books.length; i++) {
        bookImages.push(await minioService.getCoverBook(books[i].bookImage));
      }
      for (let i = 0; i < books.length; i++) {
        const buffer = books[i];
        buffer.bookImage = bookImages[i];
      }
      res.status(200).json({
        status: 200,
        bookDetail: books,
        config: {
          currentPage: currentPage + 1,
          perPage: parseInt(req.query.perpage) || perPage,
        },
      });
    }
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 404;
    }
    next(error);
  }
};
