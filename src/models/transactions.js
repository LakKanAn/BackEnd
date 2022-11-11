const { db } = require("../../db/db");
const collectionName = "transactions";

async function create(data) {
  try {
    const transactions = await db.collection(collectionName).doc();
    data.transactionId = transactions.id;
    transactions.set(data, { merge: true });
  } catch (err) {
    console.error(err);
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
    console.error(err);
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
    console.error(err);
  }
}

module.exports = {
  create,
  getAll,
  getByType,
};
