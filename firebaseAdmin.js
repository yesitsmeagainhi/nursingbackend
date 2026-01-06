import { getApps, initializeApp, cert, applicationDefault } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { readFileSync } from "node:fs";

function init() {
  if (getApps().length) return;

  // ✅ Option 1: Use GOOGLE_APPLICATION_CREDENTIALS env var (recommended)
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    initializeApp({ credential: applicationDefault() });
    return;
  }

  // ✅ Option 2: Put serviceAccountKey.json in project root
  // (download from Firebase Console → Project Settings → Service accounts)
  const serviceAccount = JSON.parse(readFileSync(new URL("src/server/serviceAccounts.json", import.meta.url)));
  initializeApp({ credential: cert(serviceAccount) });
}

init();

export const adminAuth = getAuth();
export const db = getFirestore();
