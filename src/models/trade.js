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
async function getById(offerId) {
  try {
    const offer = await (
      await db.collection(collectionOffer).doc(offerId).get()
    ).data();
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
      .set({ exchange: true }, { merge: true });
    const newPost = await db.collection(collectionOffer).doc();
    data.OfferId = newPost.id;
    newPost.create(data);
    await db
      .collection("stats")
      .doc("offer")
      .set({ totalOffers: increment }, { merge: true });

    return newBook;
  } catch (err) {
    console.log(err);
    null;
  }
}

async function postOffer(offerId, data) {
  try {
    const addOffer = await db
      .collection(collectionOffer)
      .doc(offerId)
      .set(data, { merge: true });
  } catch (err) {
    console.log(err);
    null;
  }
}
module.exports = {
  getAll,
  postBook,
  getById,
  postOffer,
};
