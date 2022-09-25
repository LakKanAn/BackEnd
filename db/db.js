// firebase
const firebase = require("firebase-admin");

if (process.env.NODE_ENV == "production") {
  firebase.initializeApp({
    credential: firebase.credential.applicationDefault(),
    // credential: firebase.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DATABASE_URL,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  });
} else {
  const serviceAccount = require("./lankkanan-firebase.json");
  firebase.initializeApp({
    credential: firebase.credential.cert(serviceAccount),
    databaseURL: "https://lakkanan.firebaseio.com",
    storageBucket: "lankkanan.appspot.com",
  });
}

const storage = firebase.storage();
exports.admin = firebase;
exports.firestore = firebase.firestore;
exports.db = firebase.firestore();
exports.storage = storage;
exports.bucket = firebase.storage().bucket();
