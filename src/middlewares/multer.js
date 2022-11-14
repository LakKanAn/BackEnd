const multer = require("multer");

const uploadBook = multer({
  limits: { fileSize: process.env.MAX_FILE_SIZE || 1024 * 1024 * 8 },
  fileFilter(file, cb) {
    if (!file.originalname.match(/\.(png|jpg|jpeg|pdf)$/)) {
      return cb(new Error("Please upload book or content"));
    }
    cb(null, true);
  },
});

module.exports = { uploadBook };
