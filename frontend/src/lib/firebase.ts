import { initializeApp } from "firebase/app";
import { getAuth, browserLocalPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyA3UDtrICmnn4cy4iGJ9Zqjvob9VeLdXcs",
  authDomain: "thequad-3087a.firebaseapp.com",
  projectId: "thequad-3087a",
  storageBucket: "thequad-3087a.appspot.com",
  messagingSenderId: "901345651993",
  appId: "1:901345651993:web:f1797d313f0f986c806988",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
// Configure storage with CORS settings
export const storage = getStorage(app);

// Enable persistence
auth.setPersistence(browserLocalPersistence);
