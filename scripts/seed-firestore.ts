import { getAdminFirestore, getFirebaseAdminApp } from "../lib/firebase/server";

const seed = async () => {
  getFirebaseAdminApp();
  const firestore = getAdminFirestore();
  const batch = firestore.batch();
  const now = new Date();

  const usersCollection = firestore.collection("users");

  const adminUser = usersCollection.doc("admin-template");
  batch.set(adminUser, {
    displayName: "Admin Player",
    email: "admin@example.com",
    photoURL: "",
    role: "admin",
    createdAt: now,
    updatedAt: now
  });

  const standardUser = usersCollection.doc("explorer-template");
  batch.set(standardUser, {
    displayName: "Explorer Player",
    email: "explorer@example.com",
    photoURL: "",
    role: "user",
    createdAt: now,
    updatedAt: now
  });

  await batch.commit();

  console.log("Seeded admin-template and explorer-template users");
};

seed()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error("Failed to seed Firestore", error);
    process.exit(1);
  });
