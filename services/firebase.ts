import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCl1QrQkADFNXMm6UKm928L_DK7oH7dIzQ",
  authDomain: "hayper-market.firebaseapp.com",
  projectId: "hayper-market",
  storageBucket: "hayper-market.firebasestorage.app",
  messagingSenderId: "593668363433",
  appId: "1:593668363433:web:c29a7770c9e60cd62e85b8",
  measurementId: "G-86GEJC7J0X"
};

// Check if app is already initialized to avoid "Service not available" or duplicate app errors
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);