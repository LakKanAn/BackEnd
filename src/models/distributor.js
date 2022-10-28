const { db } = require("../../db/db");
const collectionName = "distributors";

async function getAll() {
  try {
    const totals = await db.collection(collectionName).get();
    return totals;
  } catch (err) {
    return null;
  }
}

async function getById(distributorId) {
  try {
    const distributor = await (
      await db.collection(collectionName).doc(distributorId).get()
    ).data();
    return distributor;
  } catch (err) {}
}
async function checkDistributor(email) {
  try {
    const user = await db
      .collection(collectionName)
      .where("email", "==", email)
      .get();
    return user;
  } catch (err) {
    return null;
  }
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
  checkDistributor,
  registration,
};
