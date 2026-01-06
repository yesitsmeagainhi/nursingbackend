// src/firebase/firebaseInstance.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import {
    getAuth,
    setPersistence,
    browserLocalPersistence,
    GoogleAuthProvider,
} from 'firebase/auth';
// Your Firebase configuration object (replace with your actual config)
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FB_API_KEY,
    authDomain: import.meta.env.VITE_FB_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FB_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FB_STORAGE_BUCKET,
    appId: import.meta.env.VITE_FB_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore and Firebase Storage
const firestoreInstance = getFirestore(app);
const storageInstance = getStorage(app);
// Auth with LOCAL persistence (survives browser restarts ~1yr)
export const auth = getAuth(app);
setPersistence(auth, browserLocalPersistence).catch(() => { });

export const googleProvider = new GoogleAuthProvider();
// Export instances for use in other files
export { firestoreInstance, storageInstance };
