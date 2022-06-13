const multer = require("multer");

const uploadBook = multer({
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(png|jpg|jpeg|pdf)$/)) {
      return cb(new Error("Please upload book"));
    }
    cb(null, true);
  },
});

module.exports = { uploadBook };
