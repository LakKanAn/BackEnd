const { db, admin } = require("../../db/db");
const jwt = require("jsonwebtoken");
// const SECRET = "process.env.SECRET_KEY";
const SECRET = process.env.SITE_TOKEN;
module.exports = (req, res, next) => {
  const authorization = req.headers["authorization"];
  let decodedToken;
  let accessToken;
  try {
    accessToken = authorization.split(" ")[1];
  } catch (err) {
    return res
      .status(400)
      .json({ status: 400, message: "Bad Request", err: err });
  }
  try {
    decodedToken = jwt.verify(accessToken, SECRET);
    if (!decodedToken.uid) {
      throw "Unauthorized";
    }
    req.userId = decodedToken.uid;
    next();
  } catch (err) {
    res.status(401).json({ status: 401, message: "Unauthorized", error: err });
  }
};
