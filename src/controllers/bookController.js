const bookModel = require("../models/books");
const { validationResult } = require("express-validator");
const minioService = require("../services/minio");

exports.getAll = async (req, res, next) => {
  try {
    let books = [];
    let bookImages = [];
    const snapshot = await bookModel.getBookAll();
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
      return res.status(404).json({ status: 404, msg: "Don't have any book" });
    } else if (book.release === false) {
      return res.status(404).json({ status: 404, msg: "Don't have any book" });
    } else {
      const coverBook = await minioService.getCoverBook(book.bookImage);
      book.bookImage = coverBook;
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

exports.getByCategoryAndGenre = async (req, res, next) => {
  try {
    const category = req.query.category;
    const genre = req.query.genre;
    if (genre === undefined && category === undefined) {
      return res
        .status(404)
        .json({ status: 404, msg: "Please fill in a category or genre" });
    }
    let separateGenre = genre ? genre.split("-") : [];
    let books = [];
    let bookImages = [];
    if (genre && category) {
      const snapshotCategoryAndGenre = await bookModel.getByCategoryAndGenre(
        category,
        separateGenre
      );
      snapshotCategoryAndGenre.forEach((doc) => {
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
      return res.status(200).json({
        status: 200,
        bookDetail: books,
      });
    }
    if (genre === undefined) {
      const snapshotCategory = await bookModel.getByCategory(category);
      snapshotCategory.forEach((doc) => {
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
      return res.status(200).json({
        status: 200,
        bookDetail: books,
      });
    }
    if (category === undefined) {
      const snapshotGenre = await bookModel.getByGenre(separateGenre);
      snapshotGenre.forEach((doc) => {
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
      return res.status(200).json({
        status: 200,
        bookDetail: books,
      });
    }

    if (books.length === 0 || (genre === undefined && category === undefined)) {
      res.status(404).json({ status: 404, msg: "Don't have any book" });
    } else if (books.release === false) {
      res.status(404).json({ status: 404, msg: "Don't have any book" });
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
    let books = [];
    let bookImages = [];
    const snapshotSearch = await bookModel.search(bookTitle);
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
      });
    }
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 404;
    }
    next(error);
  }
};
