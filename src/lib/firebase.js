import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD-ExXx2nkIWlUEao_dOTyfnvxEWE76yIU",
  authDomain: "lid-shop.firebaseapp.com",
  projectId: "lid-shop",
  storageBucket: "lid-shop.firebasestorage.app",
  messagingSenderId: "264653021326",
  appId: "1:264653021326:web:4ad94abd67ae02ddbce9df",
  measurementId: "G-GS5Y1LHJQZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

let analytics;

export const initAnalytics = () => {
  if (typeof window !== "undefined") {
    const consent = localStorage.getItem("lid_cookie_consent");
    const preferences = JSON.parse(localStorage.getItem("lid_cookie_preferences") || "{}");
    
    // Initialize if explicit consent 'all' or custom with analytics=true
    if (consent === "all" || (consent === "custom" && preferences.analytics)) {
      if (!analytics) {
        analytics = getAnalytics(app);
      }
    }
  }
};

// Try to initialize on load
initAnalytics();

export { app, analytics };
