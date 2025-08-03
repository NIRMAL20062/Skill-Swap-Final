
// This file is no longer used by the application logic and can be considered deprecated.
// The server-side logic has been migrated to a Firebase Cloud Function 
// located in /functions/src/index.ts to ensure reliability.
import * as admin from 'firebase-admin';

// This file is intentionally left with minimal code to avoid initialization errors
// during the build process, as it might still be part of the dependency graph.

if (!admin.apps.length) {
  // A dummy initialization might be necessary if other parts of the build
  // process still import this file.
}

export const db = admin.apps.length ? admin.firestore() : null;
export const auth = admin.apps.length ? admin.auth() : null;
