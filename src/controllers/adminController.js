const { firestore, admin } = require("../../db/db");
const distributorModel = require("../models/distributor");
const bookModel = require("../models/books");
const userModel = require("../models/users");
const reportModel = require("../models/reports");
const transactionModel = require("../models/transactions");
var validator = require("email-validator");
const adminUid = process.env.ADMIN_UID;

exports.addDistributor = async (req, res, next) => {
  try {
    const userId = req.userId;
    if (userId != adminUid) {
      return res.status(403).json({ status: 403, msg: "not a permission" });
    }
    const email = req.body.email;
    const password = req.body.password;
    const displayName = req.body.displayName;
    const company = req.body.company;
    const address = req.body.address;
    if (!(email && password && company && address && displayName)) {
      return res.status(400).json({
        status: 400,
        msg: "Please fill out the information completely.",
      });
    }
    const checkEmail = validator.validate(email);
    switch (checkEmail) {
      case true:
        await admin
          .auth()
          .createUser({ email, password })
          .then(async () => {
            const getUid = await admin.auth().getUserByEmail(email);
            const joinAt = firestore.FieldValue.serverTimestamp();
            const data = {};
            data.displayName = displayName;
            data.email = email;
            data.address = address;
            data.company = company;
            data.role = "distributor";
            data.joinAt = joinAt;
            const newDistributor = await distributorModel.registration(
              getUid.uid,
              data
            );
            return res.status(201).json({ status: 201, newDistributor });
          })
          .catch((error) => {
            return res.status(400).json({ status: 400, msg: error.message });
          });
        break;
      case false:
        return res
          .status(400)
          .json({ status: 400, msg: "Email pattern not valid" });
    }
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 404;
    }
    next(error);
  }
};

exports.getDistributorAll = async (req, res, next) => {
  try {
    const userId = req.userId;
    if (userId != adminUid) {
      return res.status(403).json({ status: 403, msg: "not a permission" });
    }
    const perPage = parseInt(req.query.perpage) || 9;
    const currentPage = req.query.page - 1 || 0;
    let lists = [];
    const snapshot = await distributorModel.getAll();
    snapshot.forEach((doc) => {
      let data = doc.data();
      lists.push({ ...data, id: doc.id });
    });

    res.status(200).json({
      status: 200,
      distributors: lists,
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 404;
    }
    next(error);
  }
};

exports.getTransactionAll = async (req, res, next) => {
  try {
    const userId = req.userId;
    if (userId != adminUid) {
      return res.status(403).json({ status: 403, msg: "not a permission" });
    }
    const perPage = parseInt(req.query.perpage) || 9;
    const currentPage = req.query.page - 1 || 0;
    let lists = [];
    const snapshot = await transactionModel.getAll(perPage, currentPage);
    snapshot.forEach((doc) => {
      let data = doc.data();
      lists.push({ ...data, id: doc.id });
    });
    const countDoc = snapshot.size;
    let totalPage = Math.ceil(countDoc / perPage);

    res.status(200).json({
      status: 200,
      transactions: lists,
      config: {
        currentPage: currentPage + 1,
        perPage: parseInt(req.query.perpage) || perPage,
        totalPage: totalPage,
      },
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 404;
    }
    next(error);
  }
};

exports.getTransactionByType = async (req, res, next) => {
  try {
    const userId = req.userId;
    if (userId != adminUid) {
      return res.status(403).json({ status: 403, msg: "not a permission" });
    }
    const type = req.query.type;
    const perPage = parseInt(req.query.perpage) || 9;
    const currentPage = req.query.page - 1 || 0;
    let lists = [];
    const snapshot = await transactionModel.getByType(
      type,
      perPage,
      currentPage
    );
    snapshot.forEach((doc) => {
      let data = doc.data();
      lists.push({ ...data, id: doc.id });
    });
    const countDoc = snapshot.size;
    let totalPage = Math.ceil(countDoc / perPage);

    res.status(200).json({
      status: 200,
      transactions: lists,
      config: {
        currentPage: currentPage + 1,
        perPage: parseInt(req.query.perpage) || perPage,
        totalPage: totalPage,
      },
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 404;
    }
    next(error);
  }
};

exports.getTotalUser = async (req, res, next) => {
  try {
    const userId = req.userId;
    if (userId != adminUid) {
      return res.status(403).json({ status: 403, msg: "not a permission" });
    }
    let lists = [];
    const snapshot = await userModel.getAll();
    snapshot.forEach((doc) => {
      let data = doc.data();
      lists.push({ ...data, id: doc.id });
    });
    const countDoc = snapshot.size;

    res.status(200).json({
      status: 200,
      totalUser: countDoc,
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 404;
    }
    next(error);
  }
};

exports.getTotalBook = async (req, res, next) => {
  try {
    const userId = req.userId;
    if (userId != adminUid) {
      return res.status(403).json({ status: 403, msg: "not a permission" });
    }
    let lists = [];
    const snapshot = await bookModel.getBookAllByAdmin();
    snapshot.forEach((doc) => {
      let data = doc.data();
      lists.push({ ...data, id: doc.id });
    });
    const countDoc = snapshot.size;
    let data = [];
    for (let i = 0; i < lists.length; i++) {
      data.push(lists[i].release);
    }
    res.status(200).json({
      status: 200,
      totalBook: countDoc,
      totalBookRelease: data.filter((obj) => obj == true).length,
      totalBookNotRelease: data.filter((obj) => obj == false).length,
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 404;
    }
    next(error);
  }
};

exports.getTotalDistributor = async (req, res, next) => {
  try {
    const userId = req.userId;
    if (userId != adminUid) {
      return res.status(403).json({ status: 403, msg: "not a permission" });
    }
    let lists = [];
    const snapshot = await distributorModel.getAll();
    snapshot.forEach((doc) => {
      let data = doc.data();
      lists.push({ ...data, id: doc.id });
    });
    const countDoc = snapshot.size;

    res.status(200).json({
      status: 200,
      totalDistributor: countDoc,
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 404;
    }
    next(error);
  }
};

exports.getReportAll = async (req, res, next) => {
  try {
    const userId = req.userId;
    if (userId != adminUid) {
      return res.status(403).json({ status: 403, msg: "not a permission" });
    }
    const perPage = parseInt(req.query.perpage) || 9;
    const currentPage = req.query.page - 1 || 0;
    let lists = [];
    const snapshot = await reportModel.getAll(perPage, currentPage);
    snapshot.forEach((doc) => {
      let data = doc.data();
      lists.push({ ...data, id: doc.id });
    });
    const countDoc = snapshot.size;
    let totalPage = Math.ceil(countDoc / perPage);

    res.status(200).json({
      status: 200,
      reports: lists,
      config: {
        currentPage: currentPage + 1,
        perPage: parseInt(req.query.perpage) || perPage,
        totalPage: totalPage,
      },
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 404;
    }
    next(error);
  }
};

exports.getReportById = async (req, res, next) => {
  try {
    const reportId = req.params.reportId;
    const userId = req.userId;
    if (userId != adminUid) {
      return res.status(403).json({ status: 403, msg: "not a permission" });
    }
    const report = await reportModel.getById(reportId);
    if (!report) {
      return res
        .status(404)
        .json({ status: 404, msg: "Don't have any report" });
    }
    return res.status(200).json({
      status: 200,
      reportDetails: report,
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 404;
    }
    next(error);
  }
};
