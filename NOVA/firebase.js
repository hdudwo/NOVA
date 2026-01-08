// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBbTNl38BsH6lGQ9d4nyOIJCH5GlC0SWuU",
  authDomain: "nova-f12cb.firebaseapp.com",
  projectId: "nova-f12cb",
  storageBucket: "nova-f12cb.firebasestorage.app",
  messagingSenderId: "968263593222",
  appId: "1:968263593222:web:f2bfcdb349ff80969e4287",
  measurementId: "G-61C7FZTQVD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);