const Minio = require("minio");

const minioClient = new Minio.Client({
  endPoint: "localhost",
  port: 9000,
  useSSL: false,
  accessKey: process.env.ACCESSKEY,
  secretKey: process.env.SECRETKEY,
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
    const dataStream = await minioClient.getObject("books", originalname);
    return dataStream;
  } catch (err) {
    return null;
  }
}

module.exports = { uploadFile, getCoverBook };
