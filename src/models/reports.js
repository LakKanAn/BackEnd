const { db } = require("../../db/db");
const collectionName = "reports";

async function createReport(data) {
  try {
    const newReport = await db.collection(collectionName).doc();
    data.reportId = newReport.id;
    newReport.create(data);
    return newReport;
  } catch (err) {
    console.error(err);
  }
}
async function getAll(perPage, currentPage) {
  try {
    const reports = await db
      .collection(collectionName)
      .limit(perPage)
      .offset(currentPage * perPage)
      .get();
    return reports;
  } catch (err) {
    console.error(err);
  }
}
async function getById(reportId) {
  try {
    const report = await (
      await db.collection(collectionName).doc(reportId).get()
    ).data();
    return report;
  } catch (err) {
    console.error(err);
  }
}
module.exports = {
  createReport,
  getAll,
  getById,
};
