// src/lib/firebaseAdmin.ts
import admin from "firebase-admin";

// Check if Firebase Admin has already been initialized
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: "hr-app-6e17e",
      clientEmail: "YOUR_CLIENT_EMAIL",
      privateKey: "YOUR_PRIVATE_KEY".replace(/\\n/g, "\n"),
    }),
  });
}

export const messaging = admin.messaging();
