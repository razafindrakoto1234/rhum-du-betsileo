import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

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
  const { projectId, clientEmail, privateKey } = getServiceAccount();

  initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey,
    }),
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  });
}

export const adminAuth = getAuth();
export const adminDb = getFirestore();
