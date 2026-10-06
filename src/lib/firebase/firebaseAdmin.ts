import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

function getServiceAccount() {
  const envKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

  if (!envKey) {
    throw new Error(
      "La variable d'environnement FIREBASE_SERVICE_ACCOUNT_KEY est manquante.",
    );
  }

  try {
    const parsed = typeof envKey === "string" ? JSON.parse(envKey) : envKey;

    return {
      projectId: parsed.project_id,
      clientEmail: parsed.client_email,
      privateKey: parsed.private_key
        ? parsed.private_key.replace(/\\n/g, "\n")
        : undefined,
    };
  } catch (error) {
    console.error("Erreur de parsing de FIREBASE_SERVICE_ACCOUNT_KEY:", error);
    throw new Error("Impossible de décoder FIREBASE_SERVICE_ACCOUNT_KEY.");
  }
}

if (!getApps().length) {
  const serviceAccount = getServiceAccount();

  const bucketName =
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
    `${serviceAccount.projectId}.appspot.com`;

  initializeApp({
    credential: cert({
      projectId: serviceAccount.projectId,
      clientEmail: serviceAccount.clientEmail,
      privateKey: serviceAccount.privateKey,
    }),
    storageBucket: bucketName,
  });
}

export const adminAuth = getAuth();
export const adminDb = getFirestore();
export const adminStorage = getStorage();
