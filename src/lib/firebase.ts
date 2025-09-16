import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyBAHQjyokTcaz7GqXJUcQtOMAmFYkqiiM4",
  authDomain: "dococ-ebfeb.firebaseapp.com",
  projectId: "dococ-ebfeb",
  storageBucket: "dococ-ebfeb.appspot.com",
  messagingSenderId: "844259725843",
  appId: "1:844259725843:web:9d2a0add2c548a4b62a5e6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

export default app;