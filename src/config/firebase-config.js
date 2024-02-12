// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getDatabase } from 'firebase/database'; // Import getDatabase

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCQLqhESZGXzSIa7KYqYkl9zv_Bvuq3VHE",
  authDomain: "levelution-28ac2.firebaseapp.com",
  databaseURL: "https://levelution-28ac2-default-rtdb.firebaseio.com",
  projectId: "levelution-28ac2",
  storageBucket: "levelution-28ac2.appspot.com",
  messagingSenderId: "53247704751",
  appId: "1:53247704751:web:04f87f4bd3c64bdd8dde5a",
  measurementId: "G-CD81138JFZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Realtime Database
const database = getDatabase(app);

// Export Firebase services
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export { database }; // Export the database
