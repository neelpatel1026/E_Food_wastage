// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_APIKEY,
  authDomain: "food-delivery-e9708.firebaseapp.com",
  projectId: "food-delivery-e9708",
  storageBucket: "food-delivery-e9708.appspot.com",
  messagingSenderId: "489606308102",
  appId: "1:489606308102:web:f8f3290d70bcaa97757e87"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
export { auth, app };