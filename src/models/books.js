const { db } = require("../../db/db");
const collectionName = "books";

async function getBookAllByDistributor(distributorId) {
  try {
    const books = await db
      .collection(collectionName)
      .where("distributorId", "==", distributorId)
      .get();
    return books;
  } catch (err) {
    console.error(err);
  }
}

async function getBookAllByAdmin() {
  try {
    const totals = await db.collection(collectionName).get();
    return totals;
  } catch (err) {
    console.error(err);
  }
}

async function getBookAll() {
  try {
    const books = await db
      .collection(collectionName)
      .where("release", "==", true)
      .get();
    return books;
  } catch (err) {
    console.error(err);
  }
}

async function getBookById(bookId) {
  try {
    const book = await (
      await db.collection(collectionName).doc(bookId).get()
    ).data();
    return book;
  } catch (err) {
    console.error(err);
  }
}

async function getByGenre(genre) {
  try {
    const book = await db
      .collection(collectionName)
      .where("genre", "array-contains-any", genre)
      .get();
    return book;
  } catch (err) {
    console.error(err);
  }
}
async function getByCategory(category) {
  try {
    const book = await db
      .collection(collectionName)
      .where("category", "==", category)
      .get();
    return book;
  } catch (err) {
    console.error(err);
  }
}
async function getByCategoryAndGenre(category, genre) {
  try {
    const book = await db
      .collection(collectionName)
      .where("category", "==", category)
      .where("genre", "array-contains-any", genre)
      .get();
    return book;
  } catch (err) {
    console.error(err);
  }
}

async function search(bookTitle) {
  try {
    const book = await db
      .collection(collectionName)
      .where("bookTitle", ">=", bookTitle)
      .orderBy("bookTitle", "asc")
      .get();
    return book;
  } catch (err) {
    console.error(err);
  }
}

async function createBook(data) {
  try {
    const newBook = await db.collection(collectionName).doc();
    data.bookId = newBook.id;
    newBook.create(data);
    return newBook;
  } catch (err) {
    console.error(err);
  }
}

async function updateBook(bookId, data) {
  try {
    const book = await db
      .collection(collectionName)
      .doc(bookId)
      .set(data, { merge: true });
  } catch (err) {
    console.error(err);
  }
}

async function deleteBook(bookId) {
  try {
    await db.collection(collectionName).doc(bookId).delete();
  } catch (err) {
    console.error(err);
  }
}

module.exports = {
  /// for admin
  getBookAllByAdmin,
  ///for distributor
  getBookAllByDistributor,
  createBook,
  updateBook,
  deleteBook,
  /// for general
  getBookAll,
  getBookById,
  getByCategory,
  getByGenre,
  getByCategoryAndGenre,
  search,
};
