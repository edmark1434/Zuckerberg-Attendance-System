import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyC3bynLVhS4mo-GZaReOhqvcUKVM-0zYn4",
  authDomain: "zuckerbergattendancesystem.firebaseapp.com",
  databaseURL: "https://zuckerbergattendancesystem-default-rtdb.firebaseio.com",
  projectId: "zuckerbergattendancesystem",
  storageBucket: "zuckerbergattendancesystem.firebasestorage.app",
  messagingSenderId: "892754465701",
  appId: "1:892754465701:web:1b021a6f9559f90f320e4c",
  measurementId: "G-JXN3F5SBKH"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const database = getDatabase(app);

export default app;