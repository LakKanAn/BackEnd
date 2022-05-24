const { db } = require("../../db/db");
const collectionName = "transactions";

async function create(data) {
  try {
    const transactions = await db.collection(collectionName).doc();
    data.bookId = transactions.id;
    transactions.set(data, { merge: true });
  } catch (err) {
    return null;
  }
}

module.exports = {
  create,
};