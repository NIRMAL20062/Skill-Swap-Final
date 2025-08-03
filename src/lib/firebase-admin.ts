
// src/lib/firebase-admin.ts
import * as admin from 'firebase-admin';

// This is a server-only file.

// Ensure the app is only initialized once
if (!admin.apps.length) {
  admin.initializeApp({
    // When running on Google Cloud infrastructure, the credentials
    // are automatically discovered. No need to pass them in here.
  });
}

export const db = admin.firestore();
export const auth = admin.auth();
