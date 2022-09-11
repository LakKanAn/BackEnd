const { db } = require("../../db/db");
const firebase = require("../../db/db");
const collectionName = "books";
const increment = firebase.admin.firestore.FieldValue.increment(1);

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

async function getBookAll(perPage, currentPage) {
  try {
    const books = await db
      .collection(collectionName)
      .where("release", "==", true)
      .limit(perPage)
      .offset(currentPage * perPage)
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

async function getByGenre(genre, perPage, currentPage) {
  try {
    const book = await db
      .collection(collectionName)
      .where("genre", "array-contains-any", genre)
      .limit(perPage)
      .offset(currentPage * perPage)
      .get();
    return book;
  } catch (err) {
    console.log(err);
    null;
  }
}
async function getByCategory(category, perPage, currentPage) {
  try {
    const book = await db
      .collection(collectionName)
      .where("category", "==", category)
      .limit(perPage)
      .offset(currentPage * perPage)
      .get();
    return book;
  } catch (err) {
    console.log(err);
    null;
  }
}
async function getByCategoryAndGenre(category, genre, perPage, currentPage) {
  try {
    const book = await db
      .collection(collectionName)
      .where("category", "==", category)
      .where("genre", "array-contains-any", genre)
      .limit(perPage)
      .offset(currentPage * perPage)
      .get();
    return book;
  } catch (err) {
    console.log(err);
    null;
  }
}

async function search(bookTitle, perPage, currentPage) {
  try {
    const book = await db
      .collection(collectionName)
      .where("bookTitle", ">=", bookTitle)
      .orderBy("bookTitle", "asc")
      .limit(perPage)
      .offset(currentPage * perPage)
      .get();
    return book;
  } catch (err) {
    console.log(err);
    null;
  }
}

async function createBook(data) {
  try {
    const newBook = await db.collection(collectionName).doc();
    data.bookId = newBook.id;
    newBook.create(data);
    await db
      .collection("stats")
      .doc(collectionName)
      .set({ totalBooks: increment }, { merge: true });

    return newBook;
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

    const stats = await (
      await db.collection("stats").doc(collectionName).get()
    ).data();
    const decrement = stats.totalBooks - 1;
    await db
      .collection("stats")
      .doc(collectionName)
      .set({ totalBooks: decrement }, { merge: true });
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
  getByCategory,
  getByGenre,
  getByCategoryAndGenre,
  search,
};
