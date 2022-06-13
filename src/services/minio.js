const Minio = require("minio");

const minioClient = new Minio.Client({
  endPoint: process.env.ENDPOINT,
  useSSL: true,
  accessKey: process.env.ACCESSKEY,
  secretKey: process.env.SECRETKEY,
});

async function uploadFileImasge(contenType, originalname, buffer) {
  try {
    const metadata = {
      "Content-Type": contenType,
    };
    await minioClient.putObject("books", originalname, buffer, metadata);
    return originalname;
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
    await minioClient.putObject("contents", originalname, buffer, metadata);
    return originalname;
  } catch (err) {
    console.log(err);
    return null;
  }
}

async function getCoverBook(originalname) {
  try {
    const bookImage = await minioClient.presignedUrl(
      "GET",
      "books",
      originalname,
      24 * 60 * 60
    );
    return bookImage;
  } catch (err) {
    return null;
  }
}

async function getContentBook(originalname) {
  try {
    const bookContent = await minioClient.presignedUrl(
      "GET",
      "contents",
      originalname,
      24 * 60 * 60
    );
    return bookContent;
  } catch (err) {
    return null;
  }
}

module.exports = {
  uploadFileImasge,
  uploadFileContent,
  getCoverBook,
  getContentBook,
};
