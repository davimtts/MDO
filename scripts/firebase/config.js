import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDbKgIoNbI393q8EdOR6a-diqckiX_LaPY",
  authDomain: "iris-48b25.firebaseapp.com",
  projectId: "iris-48b25",
  storageBucket: "iris-48b25.firebasestorage.app",
  messagingSenderId: "489628967854",
  appId: "1:489628967854:web:7a6f77fe015556a9c89e3f",
  measurementId: "G-VE759B1SQG"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);