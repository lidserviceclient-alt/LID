// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBi7qUlexA0xPpL-PZnmQLibci-s0x9O8Y",
  authDomain: "lid-shop.firebaseapp.com",
  projectId: "lid-shop",
  storageBucket: "lid-shop.firebasestorage.app",
  messagingSenderId: "264653021326",
  appId: "1:264653021326:web:2c06e630b5acce60bce9df",
  measurementId: "G-J4X8N5DWH8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const enableAnalytics =
  typeof window !== "undefined" && (import.meta.env.PROD || import.meta.env.VITE_ENABLE_ANALYTICS === "true");
const analytics = enableAnalytics ? getAnalytics(app) : null;

export async function getStorageClient() {
  const { getStorage } = await import("firebase/storage");
  return getStorage(app);
}

export { app, analytics };
