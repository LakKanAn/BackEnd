const Minio = require("minio");

const minioClient = new Minio.Client({
  endPoint: "localhost",
  port: 9000,
  useSSL: false,
  accessKey: "distributors",
  secretKey: "distributors",
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

module.exports = { uploadFile };
