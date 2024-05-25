import { initializeApp } from 'firebase/app';

// Optionally import the services that you want to use
// import {...} from "firebase/auth";
// import {...} from "firebase/database";
// import {...} from "firebase/firestore";
// import {...} from "firebase/functions";
// import {...} from "firebase/storage";

// Initialize Firebase
const firebaseConfig = {
  apiKey: 'AIzaSyDhlKO9yBrDIyD7KtOeAhvRbYLcrdEDEVc',
  authDomain: 'trempc-353a7.firebaseapp.com',
  databaseURL: 'https://console.firebase.google.com/project/trempc-353a7/firestore/databases/-default-/data/~2Fgroups~2Fs7lXLDWN4Vg4oyQodR3Y',
  projectId: 'trempc-353a7',
  storageBucket: 'trempc-353a7.appspot.com',
  messagingSenderId: '6834062733',
  appId: '1:6834062733:web:358027ea4661cf0ea969c4',
  measurementId: 'G-WCVNKTVTFB',
};

const app = initializeApp(firebaseConfig);
// For more information on how to access Firebase in your project,
// see the Firebase documentation: https://firebase.google.com/docs/web/setup#access-firebase
