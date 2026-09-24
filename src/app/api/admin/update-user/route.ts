import { adminAuth, adminDb } from "@/lib/firebase/firebaseAdmin";
import { NextResponse } from "next/server";

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const userId = body.userID || body.userId;
    const { name, smartphone, mail, image } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "L'identifiant de l'utilisateur (userID) est requis." },
        { status: 400 },
      );
    }

    // 1. Préparation pour Firebase Auth
    const authUpdates: {
      displayName?: string;
      email?: string;
      photoURL?: string | null;
    } = {};

    if (name !== undefined) authUpdates.displayName = name;
    if (mail !== undefined) authUpdates.email = mail;

    // Firebase Auth exige une URL valide (ex: http:// ou https://) ou null.
    // Il refuse les chaînes en Base64.
    if (image !== undefined) {
      if (!image) {
        authUpdates.photoURL = null; // Effacer la photo si vide
      } else if (image.startsWith("http://") || image.startsWith("https://")) {
        authUpdates.photoURL = image; // Mettre à jour seulement si c'est une vraie URL
      }
      // Si c'est du data:image/... (Base64), on l'ignore pour Firebase Auth
    }

    // Application dans Firebase Auth
    if (Object.keys(authUpdates).length > 0) {
      await adminAuth.updateUser(userId, authUpdates);
    }

    // 2. Préparation pour Firestore (Firestore accepte très bien le Base64)
    const firestoreUpdates: Record<string, any> = {
      updatedAt: new Date().toISOString(),
    };

    if (name !== undefined) firestoreUpdates.name = name;
    if (mail !== undefined) firestoreUpdates.mail = mail;
    if (smartphone !== undefined) firestoreUpdates.smartphone = smartphone;

    if (image !== undefined) {
      firestoreUpdates.photoURL = image || null;
    }

    // Application dans Firestore
    await adminDb.collection("users").doc(userId).update(firestoreUpdates);

    return NextResponse.json(
      { message: "Utilisateur mis à jour avec succès." },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Erreur lors de la mise à jour :", error);
    return NextResponse.json(
      { error: error.message || "Une erreur interne est survenue." },
      { status: 500 },
    );
  }
}
