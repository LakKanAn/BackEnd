const { db } = require("../../db/db");
const collectionName = "users";
const subCollectionName = "bookshelf";

async function getAll() {}

async function getById(userId) {
  try {
    const user = await (
      await db.collection(collectionName).doc(userId).get()
    ).data();
    return user;
  } catch (err) {
    return null;
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
    console.log(err);
    return null;
  }
}

async function registration(userId, data) {
  try {
    const newUser = await db.collection(collectionName).doc(userId);
    data.userId = newUser.id;
    newUser.set(data, { merge: true });
    return data;
  } catch (err) {
    return null;
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
    return null;
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
    console.log(err);
    return null;
  }
}

async function getBookAll(userId) {
  try {
    const bookshelf = await db
      .collection(collectionName)
      .doc(userId)
      .collection(subCollectionName)
      .where("post", "==", false)
      .where("exchange", "==", false)
      .get();
    return bookshelf;
  } catch (error) {
    return null;
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
    return null;
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
