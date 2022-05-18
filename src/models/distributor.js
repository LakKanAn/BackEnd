const { db } = require("../../db/db");
const collectionName = "distributors";
const subCollectionName = "books";

async function getAll() {}

async function getById(distributorId) {
  try {
    const distributor = await (
      await db.collection(collectionName).doc(distributorId).get()
    ).data();
    return distributor;
  } catch (err) {}
}

async function registration(distributorId, data) {
  try {
    await db
      .collection(collectionName)
      .doc(distributorId)
      .set(data, { merge: true });
    return data;
  } catch (err) {
    return null;
  }
}

module.exports = {
  getAll,
  getById,
  registration,
};
