const { db } = require("../../db/db");
const firebase = require("../../db/db");
const increment = firebase.admin.firestore.FieldValue.increment(1);
const collectionOffer = "offer";
const collectionExchange = "exchange";

async function addOffer(data) {
  try {
    const newOffer = await db.collection(collectionOffer).doc();
    data.OfferId = newOffer.id;
    newOffer.create(data);
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

module.exports = {
  addOffer,
};
