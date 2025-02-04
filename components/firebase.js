// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDSkcIsGmHTADLo7Pmck61qag4s8g1iIlM",
  authDomain: "traffic-app-98591.firebaseapp.com",
  projectId: "traffic-app-98591",
  storageBucket: "traffic-app-98591.appspot.com",
  messagingSenderId: "384301306370",
  appId: "1:384301306370:web:6bfccf901c633e6e760d1b",
  measurementId: "G-7WLN6CQT0B",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
