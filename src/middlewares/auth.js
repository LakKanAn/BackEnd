const jwt = require("jsonwebtoken");
const { db, admin } = require("../../db/db");
const SECRET = process.env.SITE_TOKEN;
module.exports = async (req, res, next) => {
  const authorization = req.headers["authorization"];
  let decodedToken;
  let access_token;
  try {
    access_token = authorization.split(" ")[1];
  } catch (err) {
    res.status(400).json({ status: 400, message: "Bad Request", err: err });
  }
  try {
    decodedToken = await admin.auth().verifyIdToken(access_token);
    // const user = await admin.auth().getUser(tmpUser.uid);
    if (!decodedToken.uid) {
      throw "Unauthorized";
    }
    req.userId = decodedToken.uid;
    next();
  } catch (err) {
    res.status(401).json({ status: 401, message: "Unauthorized", error: err });
  }
};
