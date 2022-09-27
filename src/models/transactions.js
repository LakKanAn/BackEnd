const { db } = require("../../db/db");
const collectionName = "transactions";

async function create(data) {
  try {
    const transactions = await db.collection(collectionName).doc();
    data.transactionId = transactions.id;
    transactions.set(data, { merge: true });
  } catch (err) {
    console.log(err);
    return null;
  }
}

async function getAll(perPage, currentPage) {
  try {
    const book = await db
      .collection(collectionName)
      .limit(perPage)
      .offset(currentPage * perPage)
      .get();
    return book;
  } catch (err) {
    console.log(err);
    null;
  }
}

async function getByType(type, perPage, currentPage) {
  try {
    const book = await db
      .collection(collectionName)
      .where("type", "==", type)
      .limit(perPage)
      .offset(currentPage * perPage)
      .get();
    return book;
  } catch (err) {
    console.log(err);
    null;
  }
}

module.exports = {
  create,
  getAll,
  getByType,
};
