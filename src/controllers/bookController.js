const bookModel = require("../models/books");
const { validationResult } = require("express-validator");
const minioService = require("../services/minio");

exports.getAll = async (req, res, next) => {
  try {
    const perPage = parseInt(req.query.perpage) || 9;
    const currentPage = req.query.page - 1 || 0;
    let books = [];
    let bookImages = [];
    const snapshot = await bookModel.getBookAll(perPage, currentPage);
    snapshot.forEach((doc) => {
      let data = doc.data();
      books.push({ ...data, id: doc.id });
    });
    const countDoc = snapshot.size;
    let totalPage = Math.ceil(countDoc / perPage);
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
    const perPage = parseInt(req.query.perpage) || 9;
    const currentPage = req.query.page - 1 || 0;
    let separateGenre = genre ? genre.split("-") : [];
    let books = [];
    let bookImages = [];
    if (genre && category) {
      const snapshotCategoryAndGenre = await bookModel.getByCategoryAndGenre(
        category,
        separateGenre,
        perPage,
        currentPage
      );
      snapshotCategoryAndGenre.forEach((doc) => {
        let data = doc.data();
        books.push({ ...data, id: doc.id });
      });
      const countDoc = snapshotCategoryAndGenre.size;
      let totalPage = Math.ceil(countDoc / perPage);
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
        config: {
          currentPage: currentPage + 1,
          perPage: parseInt(req.query.perpage) || perPage,
          totalPage: totalPage,
        },
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
      const countDoc = snapshotCategory.size;
      let totalPage = Math.ceil(countDoc / perPage);
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
        config: {
          currentPage: currentPage + 1,
          perPage: parseInt(req.query.perpage) || perPage,
          totalPage: totalPage,
        },
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
      const countDoc = snapshotGenre.size;
      let totalPage = Math.ceil(countDoc / perPage);
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
        config: {
          currentPage: currentPage + 1,
          perPage: parseInt(req.query.perpage) || perPage,
          totalPage: totalPage,
        },
      });
    }

    if (books.length === 0 || (genre === undefined && category === undefined)) {
      return res.status(404).json({ status: 404, msg: "Don't have any book" });
    } else if (books.release === false) {
      return res.status(404).json({ status: 404, msg: "Don't have any book" });
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
    const countDoc = snapshot.size;
    let totalPage = Math.ceil(countDoc / perPage);
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
          totalPage: totalPage,
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
