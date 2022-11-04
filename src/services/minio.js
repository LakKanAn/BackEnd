const Minio = require("minio");

const minioClient = new Minio.Client({
  endPoint: process.env.ENDPOINT,
  // endPoint: "localhost",
  // port: 9000,
  useSSL: true,
  // useSSL: false,
  accessKey: process.env.ACCESSKEY,
  secretKey: process.env.SECRETKEY,
});

async function uploadFileCover(contenType, originalname, buffer) {
  try {
    const metadata = {
      "Content-Type": contenType,
    };
    if (process.env.NODE_ENV == "production") {
      await minioClient.putObject("books-prd", originalname, buffer, metadata);
      return originalname;
    } else {
      await minioClient.putObject("books", originalname, buffer, metadata);
      return originalname;
    }
  } catch (err) {
    console.log(err);
    return null;
  }
}
async function uploadFileContent(contenType, originalname, buffer) {
  try {
    const metadata = {
      "Content-Type": contenType,
    };
    if (process.env.NODE_ENV == "production") {
      await minioClient.putObject(
        "contents-prd",
        originalname,
        buffer,
        metadata
      );
      return originalname;
    } else {
      await minioClient.putObject("contents", originalname, buffer, metadata);
      return originalname;
    }
  } catch (err) {
    console.log(err);
    return null;
  }
}

async function getCoverBook(originalname) {
  try {
    if (process.env.NODE_ENV == "production") {
      const bookImage = await minioClient.presignedUrl(
        "GET",
        "books-prd",
        originalname,
        24 * 60 * 60
      );
      return bookImage;
    } else {
      const bookImage = await minioClient.presignedUrl(
        "GET",
        "books",
        originalname,
        24 * 60 * 60
      );
      return bookImage;
    }
  } catch (err) {
    console.log(err);
    return null;
  }
}

async function getContentBook(originalname) {
  try {
    if (process.env.NODE_ENV == "production") {
      const bookContent = await minioClient.presignedUrl(
        "GET",
        "contents-prd",
        originalname,
        24 * 60 * 60
      );
      return bookContent;
    } else {
      const bookContent = await minioClient.presignedUrl(
        "GET",
        "contents",
        originalname,
        24 * 60 * 60
      );
      return bookContent;
    }
  } catch (err) {
    return null;
  }
}

module.exports = {
  uploadFileCover,
  uploadFileContent,
  getCoverBook,
  getContentBook,
};
