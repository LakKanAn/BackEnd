const { db } = require("../../db/db");
const collectionName = "stats";
const firebase = require("../../db/db");

async function getStatsBook(perPage, currentPage) {
  try {
    const stats = await (
      await db.collection(collectionName).doc("books").get()
    ).data();
    return stats;
  } catch (err) {
    console.log(err);
    null;
  }
}
module.exports = { getStatsBook };
