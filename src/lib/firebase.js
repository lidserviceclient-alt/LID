import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBzwK8o54ws8EWYp8reSj7aZbWQ6iM1g84",
  authDomain: "life-distribution.firebaseapp.com",
  projectId: "life-distribution",
  storageBucket: "life-distribution.firebasestorage.app",
  messagingSenderId: "988883813912",
  appId: "1:988883813912:web:b1da42800edf53b596256d",
  measurementId: "G-ZNLG7JPLPE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export { app, analytics };
