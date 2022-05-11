const { db } = require("../../db/db");
const collectionName = "distributors";
const subCollectionName = "books";

async function getAll() {}

async function getById(userId) {
  return await db.collection(collectionName).doc(userId).get();
}
async function registration(distributorId, data) {
  return await db
    .collection(collectionName)
    .doc(distributorId)
    .set(data, { merge: true });
}

async function createBook(distributorId, data) {
  return await db
    .collection(collectionName)
    .doc(distributorId)
    .collection(subCollectionName)
    .doc()
    .set(data, { merge: true });
}

module.exports = {
  getAll,
  getById,
  registration,
  createBook,
};
