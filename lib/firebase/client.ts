import { type FirebaseApp, getApps, initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

import { getFirebaseClientConfig } from "./config.ts";

let clientApp: FirebaseApp | undefined;

export const getFirebaseApp = (): FirebaseApp => {
  if (!clientApp) {
    clientApp = getApps()[0] ?? initializeApp(getFirebaseClientConfig());
  }

  return clientApp;
};

export const firebaseAuth = getAuth(getFirebaseApp());
export const firebaseFirestore = getFirestore(getFirebaseApp());
export const googleAuthProvider = new GoogleAuthProvider();

googleAuthProvider.setCustomParameters({ prompt: "select_account" });

firebaseAuth.useDeviceLanguage?.();
