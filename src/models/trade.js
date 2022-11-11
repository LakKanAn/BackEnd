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
    console.error(err);
  }
}
async function getById(postId) {
  try {
    const post = await (
      await db.collection(collectionOffer).doc(postId).get()
    ).data();
    return post;
  } catch (err) {
    console.error(err);
  }
}
async function getOwnPostAll(userId, perPage, currentPage) {
  try {
    const Owner = await db
      .collection(collectionOffer)
      .where("owner_userId", "==", userId)
      .limit(perPage)
      .offset(currentPage * perPage)
      .get();
    return Owner;
  } catch (err) {
    console.error(err);
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

    return newPost;
  } catch (err) {
    console.error(err);
  }
}
async function postOffer(postId, data) {
  try {
    const addOffer = await db
      .collection(collectionOffer)
      .doc(postId)
      .set(data, { merge: true });
  } catch (err) {
    console.error(err);
  }
}
async function cancelPostBook(userId, bookId, postId) {
  try {
    await db
      .collection(collectionUsers)
      .doc(userId)
      .collection(collectionBookshelf)
      .doc(bookId)
      .set({ post: false }, { merge: true });
    const Post = await db.collection(collectionOffer).doc(postId).delete();
    return Post;
  } catch (err) {
    console.error(err);
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
      .set({ exchange: true, post: false }, { merge: true });
    const deletePost = await db
      .collection(collectionOffer)
      .doc(postId)
      .delete();
    return confirm;
  } catch (err) {
    console.error(err);
  }
}
async function getOfferPost(offerUserId, offerBookId) {
  try {
    const post = await db
      .collection(collectionOffer)
      .where("owner_userId", "==", offerUserId)
      .where("owner_bookId", "==", offerBookId)
      .get();
    return post;
  } catch (err) {
    console.error(err);
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
    console.error(err);
  }
}
async function getBookTradeAll(perPage, currentPage) {
  try {
    const exchange = await db
      .collection(collectionExchange)
      .limit(perPage)
      .offset(currentPage * perPage)
      .get();
    return exchange;
  } catch (err) {
    console.error(err);
  }
}
async function getBookTradeById(exchangeId) {
  try {
    const exchange = await (
      await db.collection(collectionExchange).doc(exchangeId).get()
    ).data();
    return exchange;
  } catch (err) {
    console.error(err);
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
    console.error(err);
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
  } catch (err) {
    console.error(err);
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
    console.error(err);
  }
}
module.exports = {
  getAll,
  postBook,
  getById,
  getOwnPostAll,
  postOffer,
  confirm,
  getOfferPost,
  cancelPostBook,
  deletePost,
  getBookTradeAll,
  getBookTradeById,
  checkDuring,
  rollback,
  deleteExchange,
};
