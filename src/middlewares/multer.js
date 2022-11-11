const multer = require("multer");

const uploadBook = multer({
  limits: { fieldSize: 8000000 },
  fileFilter(file, cb) {
    if (!file.originalname.match(/\.(png|jpg|jpeg|pdf)$/)) {
      return cb(new Error("Please upload book or content"));
    }
    cb(null, true);
  },
});

module.exports = { uploadBook };
