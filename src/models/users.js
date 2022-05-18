const e = require("express");
const { db } = require("../../db/db");
const collectionName = "users";
const subCollectionName = "bookshelf";

async function getAll() {}

async function getById(userId) {
  try {
    const user = await (
      await db.collection(collectionName).doc(userId).get()
    ).data();
    return user;
  } catch (err) {
    return null;
  }
}

async function checkUser(email) {
  try {
    const user = await db
      .collection(collectionName)
      .where("email", "==", email)
      .get();
    return user;
  } catch (err) {
    console.log(err);
    return null;
  }
}

async function registration(userId, data) {
  try {
    const newUser = await db.collection(collectionName).doc(userId);
    data.userId = newUser.id;
    newUser.set(data, { merge: true });
    return data;
  } catch (err) {
    return null;
  }
}

async function updateUser(data) {
  try {
    await db
      .collection(collectionName)
      .doc(userId)
      .update(data, { merge: true });
    return data;
  } catch (err) {
    return null;
  }
}

module.exports = {
  getAll,
  getById,
  checkUser,
  registration,
  updateUser,
};
