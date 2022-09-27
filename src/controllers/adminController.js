const { firestore, admin } = require("../../db/db");
const distributorModel = require("../models/distributor");
const bookModel = require("../models/books");
const userModel = require("../models/users");
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
    if (!(email && password)) {
      return res
        .status(400)
        .json({ status: 400, msg: "Please enter a email and password" });
    }
    const checkEmail = validator.validate(email);
    switch (checkEmail) {
      case true:
        await admin
          .auth()
          .createUser({ email, password })
          .then(() => {
            return res.status(200).json({
              status: 200,
              msg: "Created successfully",
              distributor: { email, password },
            });
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
      // release.push(data);
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
