import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  // Am pus valorile false direct aici, ca string-uri (între ghilimele)
  apiKey: "AIzaSyA-FakeApiKeyPentruDezvoltareLocala123",
  authDomain: "proiect-test-local.firebaseapp.com",
  projectId: "proiect-test-local",
  storageBucket: "proiect-test-local.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890abcdef"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);