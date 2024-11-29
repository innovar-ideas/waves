// src/lib/firebaseClient.ts
import { initializeApp } from "firebase/app";
import { getMessaging, onMessage, getToken } from "firebase/messaging";

// Firebase configuration (replace with your config from Firebase Console)
const firebaseConfig = {
  apiKey: "AIzaSyCwcaqhEdPaErCS1LFDLaYVbrM3WnHkeUk",
  authDomain: "hr-app-6e17e.firebaseapp.com",
  projectId: "hr-app-6e17e",
  storageBucket: "hr-app-6e17e.firebasestorage.app",
  messagingSenderId: "30259373233",
  appId: "1:30259373233:web:72fdf64ff41bd94f9c6e90",
  measurementId: "G-BXYH9PG55C"
};
// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);

// Initialize Firebase Messaging
const messaging = getMessaging(firebaseApp);

// Function to get the FCM token
export const getFCMToken = async (setToken: (token: string | null) => void) => {
  try {
    const token = await getToken(messaging, {
      vapidKey: "YOUR_WEB_PUSH_CERTIFICATE_KEY_PAIR",
    });
    setToken(token);
  } catch (error) {
    console.error("Unable to get FCM token:", error);
    setToken(null);
  }
};

// Handle messages received while the app is in the foreground
export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });
