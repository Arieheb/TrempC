// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import {getStorage} from 'firebase/storage';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDjHLRwQmzyxe64_mA61QSH2fQ5RFSXLKA",
  authDomain: "trempc-ebfea.firebaseapp.com",
  projectId: "trempc-ebfea",
  storageBucket: "trempc-ebfea.appspot.com",
  messagingSenderId: "881821444367",
  appId: "1:881821444367:web:8c28f0e4f36ff21bb8367a",
  measurementId: "G-MXK4D8WNRH"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app)
export { db, auth, storage};