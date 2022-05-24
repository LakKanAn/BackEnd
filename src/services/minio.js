const Minio = require("minio");

const minioClient = new Minio.Client({
  endPoint: "minioapi.lakkanan.shop",
  useSSL: true,
  accessKey: process.env.ACCESSKEY,
  secretKey: process.env.SECRETKEY,
});

async function uploadFile(contenType, originalname, buffer) {
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

module.exports = { uploadFile, getCoverBook };
