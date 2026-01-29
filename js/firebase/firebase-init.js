import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js';
import { getDatabase } from 'https://www.gstatic.com/firebasejs/12.7.0/firebase-database.js';

/**
 * Configuration object for Firebase initialization.
 * Stores all project credentials and connection details.
 */
const firebaseConfig = {
  apiKey: "AIzaSyAaGPxyhSuHF3oBEmyFjUFXBKE5BJnNjJ8",
  authDomain: "join-e9886.firebaseapp.com",
  databaseURL: "https://join-e9886-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "join-e9886",
  storageBucket: "join-e9886.firebasestorage.app",
  messagingSenderId: "121062855210",
  appId: "1:121062855210:web:4606d6a4ee3090061c2953"
};

/**
 * Initializes the Firebase app with the provided configuration.
 */
const app = initializeApp(firebaseConfig);

/**
 * Firebase Authentication instance, used for all user authentication actions.
 */
export const auth = getAuth(app);

/**
 * Firebase Realtime Database instance, used for all app data storage and queries.
 */
export const db = getDatabase(app);
