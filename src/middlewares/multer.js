const multer = require("multer");

function checkFileType(file, cb) {
  const filetypes = /jpeg|jpg|png|pdf/;
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype) {
    return cb(null, true);
  } else {
    cb("error: Please upload book or content");
  }
}

const uploadBook = multer({
  limits: { fileSize: process.env.MAX_FILE_SIZE || 1024 * 1024 * 8 },
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
});

module.exports = { uploadBook };
