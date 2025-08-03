
// src/lib/firebase-admin.ts
import * as admin from 'firebase-admin';

// This is a server-only file.

// Ensure the app is only initialized once
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      // When running on Google Cloud infrastructure, the credentials
      // are automatically discovered.
    });
  } catch (error) {
    console.error('Firebase admin initialization error', error);
  }
}

export const db = admin.firestore();
export const auth = admin.auth();
