const Minio = require("minio");

const minioClient = new Minio.Client({
  endPoint: "localhost",
  port: 9000,
  useSSL: false,
  accessKey: "minioadmin",
  secretKey: "minioadmin",
});

async function uploadFile(contenType, originalname, buffer) {
  try {
    const metadata = {
      "Content-Type": contenType,
    };
    await minioClient.putObject("books", originalname, buffer, metadata);
    return true;
  } catch (err) {
    return null;
  }
}

async function getCoverBook(originalname) {
  try {
    minioClient.presignedUrl("GET", "books", originalname, 24 * 60 * 60);
  } catch (err) {
    return null;
  }
}

module.exports = { uploadFile, getCoverBook };
