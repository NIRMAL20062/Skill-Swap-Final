
// src/lib/firebase-admin.ts
import * as admin from 'firebase-admin';

// This is a server-only file.

const FIREBASE_PROJECT_ID = "skillswap-amrc7";

// Ensure the app is only initialized once
if (!admin.apps.length) {
  admin.initializeApp({
    // When running on Google Cloud infrastructure, the credentials
    // are automatically discovered. For local development or other environments,
    // you might need to set up service account credentials.
    // However, specifying the project ID can often resolve initialization issues.
    projectId: FIREBASE_PROJECT_ID,
  });
}

export const db = admin.firestore();
export const auth = admin.auth();
