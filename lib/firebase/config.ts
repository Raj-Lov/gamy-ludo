import type { FirebaseOptions } from "firebase/app";

type FirebaseAdminConfig = {
  projectId: string;
  clientEmail: string;
  privateKey: string;
};

const clientDefaults: Record<string, string> = {
  NEXT_PUBLIC_FIREBASE_API_KEY: "AIzaSyCbztqG0o1znQuXsmRJkXnl4j6KoQACVc4",
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: "gamyludo-app.firebaseapp.com",
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: "gamyludo-app",
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: "gamyludo-app.firebasestorage.app",
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: "454390684376",
  NEXT_PUBLIC_FIREBASE_APP_ID: "1:454390684376:web:316d58aaad5cb2473f95ad"
};

const getEnv = (key: string, fallback?: string): string => {
  const value = process.env[key];

  if (value && value.length > 0) {
    return value;
  }

  if (fallback && fallback.length > 0) {
    return fallback;
  }

  throw new Error(`Missing required environment variable: ${key}`);
};

export const getFirebaseClientConfig = (): FirebaseOptions => ({
  apiKey: getEnv("NEXT_PUBLIC_FIREBASE_API_KEY", clientDefaults.NEXT_PUBLIC_FIREBASE_API_KEY),
  authDomain: getEnv(
    "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
    clientDefaults.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
  ),
  projectId: getEnv(
    "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
    clientDefaults.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  ),
  storageBucket: getEnv(
    "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
    clientDefaults.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
  ),
  messagingSenderId: getEnv(
    "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
    clientDefaults.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
  ),
  appId: getEnv("NEXT_PUBLIC_FIREBASE_APP_ID", clientDefaults.NEXT_PUBLIC_FIREBASE_APP_ID),
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
});

export const getFirebaseAdminConfig = (): FirebaseAdminConfig => ({
  projectId: getEnv("FIREBASE_PROJECT_ID"),
  clientEmail: getEnv("FIREBASE_CLIENT_EMAIL"),
  privateKey: getEnv("FIREBASE_PRIVATE_KEY").replace(/\\n/g, "\n")
});
