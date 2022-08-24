const { db } = require("../../db/db");
const firebase = require("../../db/db");
const increment = firebase.admin.firestore.FieldValue.increment(1);
const collectionOffer = "offer";
const collectionExchange = "exchange";
const collectionUsers = "users";
const collectionBookshelf = "bookshelf";

async function getAll(perPage, currentPage) {
  try {
    const books = await db
      .collection(collectionOffer)
      .limit(perPage)
      .offset(currentPage * perPage)
      .get();
    return books;
  } catch (err) {
    console.log(err);
    null;
  }
}
async function getById(postId) {
  try {
    const offer = await (
      await db.collection(collectionOffer).doc(postId).get()
    ).data();
    return offer;
  } catch (err) {
    console.log(err);
    null;
  }
}
async function getOwnPost(userId) {
  try {
    const offer = await db
      .collection(collectionOffer)
      .where("owner_userId", "==", userId)
      .get();
    return offer;
  } catch (err) {
    console.log(err);
    null;
  }
}
async function postBook(userId, bookId, data) {
  try {
    await db
      .collection(collectionUsers)
      .doc(userId)
      .collection(collectionBookshelf)
      .doc(bookId)
      .set({ post: true }, { merge: true });
    const newPost = await db.collection(collectionOffer).doc();
    data.postId = newPost.id;
    newPost.create(data);
    await db
      .collection("stats")
      .doc("trade")
      .set({ totalPosts: increment }, { merge: true });

    return newPost;
  } catch (err) {
    console.log(err);
    null;
  }
}
async function postOffer(postId, data) {
  try {
    const addOffer = await db
      .collection(collectionOffer)
      .doc(postId)
      .set(data, { merge: true });
  } catch (err) {
    console.log(err);
    null;
  }
}
async function confirm(
  postId,
  exhangeData,
  ownerUserId,
  offerUserId,
  ownerBookId,
  offerBookId
) {
  try {
    const confirm = await db
      .collection(collectionExchange)
      .doc(postId)
      .set(exhangeData, { merge: true });
    const owner = await db
      .collection(collectionUsers)
      .doc(ownerUserId)
      .collection(collectionBookshelf)
      .doc(ownerBookId)
      .set({ exchange: true, post: false }, { merge: true });
    const offer = await db
      .collection(collectionUsers)
      .doc(offerUserId)
      .collection(collectionBookshelf)
      .doc(offerBookId)
      .set({ exchange: true }, { merge: true });
    const deletePost = await db
      .collection(collectionOffer)
      .doc(postId)
      .delete();
    return confirm;
  } catch (err) {
    console.log(err);
    null;
  }
}
async function deletePost(postId) {
  try {
    const deletePost = await db
      .collection(collectionOffer)
      .doc(postId)
      .delete();
    return deletePost;
  } catch (err) {
    console.log(err);
    null;
  }
}
async function getBookTradeById(exchangeId) {
  try {
    const exchange = await (
      await db.collection(collectionExchange).doc(exchangeId).get()
    ).data();
    return exchange;
  } catch (err) {
    console.log(err);
    null;
  }
}
async function checkDuring(during) {
  try {
    const During = await db
      .collection(collectionExchange)
      .where("during", "<", during)
      .get();

    return During;
  } catch (err) {
    console.log(err);
    null;
  }
}
async function rollback(userId, bookId) {
  try {
    await db
      .collection(collectionUsers)
      .doc(userId)
      .collection(collectionBookshelf)
      .doc(bookId)
      .set({ post: false, exchange: false }, { merge: true });
    // await db .collection(collectionExchange).
  } catch (err) {
    console.log(err);
    null;
  }
}
async function deleteExchange(exchangeId) {
  try {
    const deleteExchange = await db
      .collection(collectionExchange)
      .doc(exchangeId)
      .delete();

    return deleteExchange;
  } catch (err) {
    console.log(err);
    null;
  }
}
module.exports = {
  getAll,
  postBook,
  getById,
  getOwnPost,
  postOffer,
  confirm,
  deletePost,
  getBookTradeById,
  checkDuring,
  rollback,
  deleteExchange,
};
