import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  type Auth,
} from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId &&
    firebaseConfig.appId
);

export const ADMIN_ALLOWLIST: string[] = (
  process.env.NEXT_PUBLIC_ADMIN_EMAILS || ""
)
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export function isAuthorizedAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  // If no explicit allowlist env is set, any authenticated Google user in that project
  // can access; once NEXT_PUBLIC_ADMIN_EMAILS is filled, strictly restrict to it.
  if (ADMIN_ALLOWLIST.length === 0) return true;
  return ADMIN_ALLOWLIST.includes(email.trim().toLowerCase());
}

let cachedApp: FirebaseApp | null = null;
let cachedAuth: Auth | null = null;
let cachedDb: Firestore | null = null;
let cachedGoogle: GoogleAuthProvider | null = null;

export function getFirebaseServices(): {
  app: FirebaseApp;
  auth: Auth;
  db: Firestore;
  googleProvider: GoogleAuthProvider;
} | null {
  if (!isFirebaseConfigured || typeof window === "undefined") {
    return null;
  }

  if (!cachedApp) {
    cachedApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  }
  if (!cachedAuth) {
    cachedAuth = getAuth(cachedApp);
  }
  if (!cachedDb) {
    cachedDb = getFirestore(cachedApp);
  }
  if (!cachedGoogle) {
    cachedGoogle = new GoogleAuthProvider();
    cachedGoogle.setCustomParameters({ prompt: "select_account" });
  }

  return {
    app: cachedApp,
    auth: cachedAuth,
    db: cachedDb,
    googleProvider: cachedGoogle,
  };
}
