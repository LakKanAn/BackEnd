const { db } = require("../../db/db");
const collectionName = "users";
const subCollectionName = "bookshelf";

async function getAll() {
  try {
    const totals = await db.collection(collectionName).get();
    return totals;
  } catch (err) {
    console.error(err);
  }
}

async function getById(userId) {
  try {
    const user = await (
      await db.collection(collectionName).doc(userId).get()
    ).data();
    return user;
  } catch (err) {
    console.error(err);
  }
}

async function checkUser(email) {
  try {
    const user = await db
      .collection(collectionName)
      .where("email", "==", email)
      .get();
    return user;
  } catch (err) {
    console.error(err);
  }
}

async function registration(userId, data) {
  try {
    const newUser = await db.collection(collectionName).doc(userId);
    data.userId = newUser.id;
    newUser.set(data, { merge: true });
    return data;
  } catch (err) {
    console.error(err);
  }
}

async function updateUser(data) {
  try {
    await db
      .collection(collectionName)
      .doc(userId)
      .update(data, { merge: true });
    return data;
  } catch (err) {
    console.error(err);
  }
}

////bookshelf
async function addBook(userId, bookId) {
  try {
    const newBook = await db
      .collection(collectionName)
      .doc(userId)
      .collection(subCollectionName)
      .doc(bookId)
      .set(
        { bookId: bookId, exchange: false, post: false, owner: userId },
        { merge: true }
      );
    return newBook;
  } catch (err) {
    console.error(err);
  }
}

async function getBookAll(userId, perPage, currentPage) {
  try {
    const bookshelf = await db
      .collection(collectionName)
      .doc(userId)
      .collection(subCollectionName)
      .where("post", "==", false)
      .where("exchange", "==", false)
      .limit(perPage)
      .offset(currentPage * perPage)
      .get();
    return bookshelf;
  } catch (error) {
    console.error(err);
  }
}

async function getBookById(userId, bookId) {
  try {
    const book = await (
      await db
        .collection(collectionName)
        .doc(userId)
        .collection(subCollectionName)
        .doc(bookId)
        .get()
    ).data();
    return book;
  } catch (err) {
    console.error(err);
  }
}

module.exports = {
  getAll,
  getById,
  checkUser,
  registration,
  updateUser,
  addBook,
  getBookAll,
  getBookById,
};
