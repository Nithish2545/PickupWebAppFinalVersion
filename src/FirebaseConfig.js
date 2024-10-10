import { initializeApp } from "firebase/app";
import { getAuth, browserLocalPersistence} from "firebase/auth"; // Web-specific imports
import { getStorage } from "firebase/storage";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCXT0P7ORMI7WFf0yU6anrqRlnGywLDwRE",
  authDomain: "shiphitmobileapppickup.firebaseapp.com",
  projectId: "shiphitmobileapppickup",
  storageBucket: "shiphitmobileapppickup.appspot.com",
  messagingSenderId: "591798517548",
  appId: "1:591798517548:web:f205493abadedf270d3689"
};
// Initialize Firebase
export const FIREBASE_APP = initializeApp(firebaseConfig);
// Conditionally initialize Firebase Auth based on the platform
export let FIREBASE_AUTH;
  // Web-based Firebase Auth with browser persistence
  FIREBASE_AUTH = getAuth(FIREBASE_APP);
  // Set persistence to localStorage or sessionStorage
  FIREBASE_AUTH.setPersistence(browserLocalPersistence)  // You can also use browserSessionPersistence here
    .then(() => {
      console.log("Web auth persistence set to local storage");
    })
    .catch((error) => {
      console.error("Error setting auth persistence on web: ", error);
    });
// Initialize Firebase Storage
export const storage = getStorage(FIREBASE_APP);