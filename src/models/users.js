const { db } = require("../../db/db");
const collectionName = "users";
const subCollectionName = "certs";

async function getAll() {}

async function getById(userId) {
  return await db.collection(collectionName).doc(userId).get();
}

async function createUser(data) {
  return await db.collection(collectionName).doc().set(data);
}

module.exports = {
  getAll,
  getById,
  createUser,
};
