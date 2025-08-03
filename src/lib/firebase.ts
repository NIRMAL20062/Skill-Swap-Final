
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAhNE3IfnNeysORqHEf3hS6mInViTlxECU",
  authDomain: "skillswap-amrc7.firebaseapp.com",
  projectId: "skillswap-amrc7",
  storageBucket: "skillswap-amrc7.firebasestorage.app",
  messagingSenderId: "1050104005974",
  appId: "1:1050104005974:web:84f0e293b97d48dd9582f7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export { app };
