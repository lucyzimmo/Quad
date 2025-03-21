const admin = require("firebase-admin");
const serviceAccount = require("./firebase_key.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://thequad-3087a-default-rtdb.firebaseio.com",
});

module.exports = admin;
