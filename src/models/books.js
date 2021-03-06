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
    console.log(err);
    null;
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
    console.log(err);
    null;
  }
}

async function getBookById(bookId) {
  try {
    const book = await (
      await db.collection(collectionName).doc(bookId).get()
    ).data();
    return book;
  } catch (err) {
    console.log(err);
    null;
  }
}
async function createBook(distributorId, data) {
  try {
    const newBook = await db.collection(collectionName).doc();
    data.bookId = newBook.id;
    newBook.set(data, { merge: true });
  } catch (err) {
    console.log(err);
    null;
  }
}

async function updateBook(bookId, data) {
  try {
    const book = await db
      .collection(collectionName)
      .doc(bookId)
      .set(data, { merge: true });
  } catch (err) {
    console.log(err);
    null;
  }
}

async function deleteBook(distributorId, bookId) {
  try {
    await db.collection(collectionName).doc(bookId).delete();
  } catch (err) {
    console.log(err);
    null;
  }
}

module.exports = {
  ///for distributor
  getBookAllByDistributor,
  createBook,
  updateBook,
  deleteBook,
  /// for general
  getBookAll,
  getBookById,
};
