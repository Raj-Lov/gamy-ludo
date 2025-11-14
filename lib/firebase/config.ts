import type { FirebaseOptions } from "firebase/app";

type FirebaseAdminConfig = {
  projectId: string;
  clientEmail: string;
  privateKey: string;
};

const getEnv = (key: string): string => {
  const value = process.env[key];

  if (!value || value.length === 0) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
};

export const getFirebaseClientConfig = (): FirebaseOptions => ({
  apiKey: getEnv("NEXT_PUBLIC_FIREBASE_API_KEY"),
  authDomain: getEnv("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN"),
  projectId: getEnv("NEXT_PUBLIC_FIREBASE_PROJECT_ID"),
  storageBucket: getEnv("NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET"),
  messagingSenderId: getEnv("NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID"),
  appId: getEnv("NEXT_PUBLIC_FIREBASE_APP_ID"),
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
});

export const getFirebaseAdminConfig = (): FirebaseAdminConfig => ({
  projectId: getEnv("FIREBASE_PROJECT_ID"),
  clientEmail: getEnv("FIREBASE_CLIENT_EMAIL"),
  privateKey: getEnv("FIREBASE_PRIVATE_KEY").replace(/\\n/g, "\n")
});
