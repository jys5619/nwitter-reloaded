import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCbvLVmJkS9S5yJ4uSawtSqjxN30jlp8Dc",
  authDomain: "nwitter-reloaded-779f5.firebaseapp.com",
  projectId: "nwitter-reloaded-779f5",
  storageBucket: "nwitter-reloaded-779f5.appspot.com",
  messagingSenderId: "922156253358",
  appId: "1:922156253358:web:d76ee859888091feda2d3f",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const storage = getStorage(app);

export const db = getFirestore(app);
