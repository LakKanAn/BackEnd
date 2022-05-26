const { db, admin } = require("../../db/db");
const jwt = require("jsonwebtoken");
const userModel = require("../models/users");
const distributorModel = require("../models/distributor");
const SECRET = process.env.SITE_TOKEN;

exports.access_token = async (req, res, next) => {
  const token = req.body.token;
  if (token !== undefined) {
    try {
      const user = await admin.auth().verifyIdToken(token);
      delete user.firebase;
      delete user.exp;
      delete user.iat;
      delete user.iss;
      delete user.sub;
      delete user.aud;
      const access_token = jwt.sign({ user: user, uid: user.uid }, SECRET);
      res.status(200).json({ status: 200, access_token: access_token });
    } catch (err) {
      res
        .status(401)
        .json({ status: 401, message: "Unauthorized", error: err });
    }
  } else {
    res.status(400).json({ status: 400, message: "Bad Request" });
  }
};
exports.me = async (req, res, next) => {
  const authorization = req.headers["authorization"];
  try {
    const access_token = authorization.split(" ")[1];
    try {
      const tmpUser = jwt.verify(access_token, SECRET);
      const user = await admin.auth().getUser(tmpUser.uid);
      const generalUser = await userModel.getById(user.uid);
      const distributor = await distributorModel.getById(user.uid);
      if (generalUser) {
        const userData = {
          uid: user.uid,
          email: user.email,
          role: generalUser.role,
          displayName: user.displayName,
        };
        return res.status(200).json({ status: 200, user: userData });
      }
      if (distributor) {
        const distributorData = {
          uid: user.uid,
          email: user.email,
          role: distributor.role,
          displayName: distributor.displayName,
        };
        return res.status(200).json({ status: 200, user: distributorData });
      }
    } catch (err) {
      res
        .status(401)
        .json({ status: 401, message: "Unauthorized", error: err });
    }
  } catch (err) {
    res.status(400).json({ status: 400, message: "Bad Request" });
  }
};

// @route /bye
exports.bye = async (req, res, next) => {
  res.status(200).json({ status: 200, message: "bye" });
};
