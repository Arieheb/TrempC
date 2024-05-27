// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDX4s7DnTuhqLWqxPULniukjQy8b_pyLHo",
  authDomain: "trempc-3063a.firebaseapp.com",
  projectId: "trempc-3063a",
  storageBucket: "trempc-3063a.appspot.com",
  messagingSenderId: "806531092309",
  appId: "1:806531092309:web:92261873c2e57f0ceaa9dc",
  measurementId: "G-HLZT5CPND2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);