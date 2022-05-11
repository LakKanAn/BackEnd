const { db } = require("../../db/db");
const collectionName = "users";
const subCollectionName = "certs";

async function getAll() {}

async function getById(userId) {
  return await (await db.collection(collectionName).doc(userId).get()).data();
}

async function registration(userId, data) {
  return await db
    .collection(collectionName)
    .doc(userId)
    .set(data, { merge: true });
}

async function updateUser(data) {
  return await db.collection(collectionName).doc(userId).update(data);
}

module.exports = {
  getAll,
  getById,
  registration,
  updateUser,
};
