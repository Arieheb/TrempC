// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDhlKO9yBrDIyD7KtOeAhvRbYLcrdEDEVc",
  authDomain: "trempc-353a7.firebaseapp.com",
  projectId: "trempc-353a7",
  storageBucket: "trempc-353a7.appspot.com",
  messagingSenderId: "6834062733",
  appId: "1:6834062733:web:358027ea4661cf0ea969c4",
  measurementId: "G-WCVNKTVTFB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);