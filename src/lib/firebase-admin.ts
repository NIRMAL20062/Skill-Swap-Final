import { initializeApp, getApps, cert, getApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

let adminApp;
let adminDb;

try {
  // Check if app is already initialized
  adminApp = getApp("admin");
  adminDb = getFirestore(adminApp);
} catch {
  // Initialize Firebase Admin for development
  // For local development, we'll use application default credentials
  const firebaseAdminConfig = {
    projectId:
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "local-testing-56e7c",
  };

  adminApp = initializeApp(firebaseAdminConfig, "admin");
  adminDb = getFirestore(adminApp);
}

export { adminDb };
