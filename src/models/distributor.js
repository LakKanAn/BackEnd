const { db } = require("../../db/db");
const collectionName = "distributors";
const subCollectionName = "books";

async function getAll() {}

async function getById(distributorId) {
  try {
    const distributor = await (
      await db.collection(collectionName).doc(distributorId).get()
    ).data();
    return distributor;
  } catch (err) {}
}

async function registration(distributorId, data) {
  try {
    await db
      .collection(collectionName)
      .doc(distributorId)
      .set(data, { merge: true });
    return data;
  } catch (err) {
    return null;
  }
}

async function getBookAll(distributorId) {
  try {
    const snapshot = await db
      .collection(collectionName)
      .doc(distributorId)
      .collection("books")
      .get();

    return snapshot;
  } catch (err) {
    console.log(err);
    null;
  }
}
async function createBook(distributorId, data) {
  try {
    const newBook = await db
      .collection(collectionName)
      .doc(distributorId)
      .collection(subCollectionName)
      .doc();
    data.bookId = newBook.id;
    newBook.set(data, { merge: true });
  } catch (err) {
    console.log(err);
    null;
  }
}

async function getBookById(distributorId, bookId) {
  try {
    const book = await (
      await db
        .collection(collectionName)
        .doc(distributorId)
        .collection(subCollectionName)
        .doc(bookId)
        .get()
    ).data();
    return book;
  } catch (err) {
    console.log(err);
    null;
  }
}

async function updateBook(distributorId, bookId, data) {
  try {
    const book = await db
      .collection(collectionName)
      .doc(distributorId)
      .collection(subCollectionName)
      .doc(bookId)
      .set(data, { merge: true });
  } catch (err) {
    console.log(err);
    null;
  }
}

async function deleteBook(distributorId, bookId) {
  try {
    await db
      .collection(collectionName)
      .doc(distributorId)
      .collection(subCollectionName)
      .doc(bookId)
      .delete();
  } catch (err) {
    console.log(err);
    null;
  }
}
module.exports = {
  getAll,
  getById,
  registration,
  createBook,
  getBookAll,
  getBookById,
  updateBook,
  deleteBook,
};
