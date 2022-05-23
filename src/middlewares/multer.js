const multer = require("multer");

const uploadBooKCover = multer({
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(png|jpg|jpeg)$/)) {
      return cb(new Error("Please upload image"));
    }
    cb(null, true);
  },
});

module.exports = uploadBooKCover;
