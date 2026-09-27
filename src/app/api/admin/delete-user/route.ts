import { verifyAdminRequest } from "@/lib/auth/verify-admin";
import { adminAuth, adminDb } from "@/lib/firebase/firebaseAdmin";
import { NextResponse } from "next/server";

export async function DELETE(request: Request) {
  // 1. Contrôle d'accès Administrateur
  const authResult = await verifyAdminRequest(request);

  if (authResult instanceof NextResponse) {
    return authResult; // Renvoie 401 ou 403 selon l'erreur
  }

  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "L'identifiant de l'utilisateur (userId) est requis." },
        { status: 400 },
      );
    }

    // 2. Suppression dans Firebase Authentication
    try {
      await adminAuth.deleteUser(userId);
    } catch (authErr: any) {
      console.warn(
        `[DELETE_USER] Avertissement Firebase Auth pour ${userId}:`,
        authErr.message,
      );
    }

    // 3. Suppression dans la collection Firestore
    await adminDb.collection("users").doc(userId).delete();

    return NextResponse.json(
      { message: "Utilisateur supprimé avec succès." },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("[DELETE_USER_ERROR] Erreur lors de la suppression :", error);
    return NextResponse.json(
      { error: error.message || "Erreur serveur lors de la suppression." },
      { status: 500 },
    );
  }
}
