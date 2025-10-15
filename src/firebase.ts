import { initializeApp, type FirebaseApp } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";

let app: FirebaseApp;
let db: Firestore;

export function getDb(): Firestore {
  if (!app) {
    app = initializeApp({
      apiKey: import.meta.env.VITE_FB_API_KEY,
      authDomain: import.meta.env.VITE_FB_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FB_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FB_STORAGE_BUCKET,
      appId: import.meta.env.VITE_FB_APP_ID,
    });
  }
  if (!db) db = getFirestore(app);
  return db;
}
