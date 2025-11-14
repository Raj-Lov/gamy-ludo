import { cert, getApps, initializeApp, type App as FirebaseAdminApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

import { getFirebaseAdminConfig } from "./config";

let adminApp: FirebaseAdminApp | undefined;

export const getFirebaseAdminApp = (): FirebaseAdminApp => {
  if (!adminApp) {
    if (!getApps().length) {
      const { projectId, clientEmail, privateKey } = getFirebaseAdminConfig();

      adminApp = initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey
        }),
        projectId
      });
    } else {
      adminApp = getApps()[0];
    }
  }

  return adminApp;
};

export const getAdminAuth = () => getAuth(getFirebaseAdminApp());
export const getAdminFirestore = () => getFirestore(getFirebaseAdminApp());
