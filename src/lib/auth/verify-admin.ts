import { adminAuth, adminDb } from "@/lib/firebase/firebaseAdmin";
import { NextResponse } from "next/server";

export interface AdminVerificationResult {
  uid: string;
  userDoc: FirebaseFirestore.DocumentSnapshot;
}

/**
 * Vérifie si la requête contient un jeton Bearer valide et si l'utilisateur est administrateur.
 * Retourne une instance de `NextResponse` en cas d'erreur, ou les informations de l'admin en cas de succès.
 */
export async function verifyAdminRequest(
  request: Request,
): Promise<AdminVerificationResult | NextResponse> {
  // 1. Vérification du header Authorization
  const authHeader = request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.error("[VERIFY_ADMIN] En-tête Authorization manquant ou invalide.");
    return NextResponse.json(
      { error: "Non autorisé. Jeton manquant." },
      { status: 401 },
    );
  }

  const token = authHeader.split("Bearer ")[1]?.trim();

  if (!token) {
    console.error("[VERIFY_ADMIN] Jeton vide après extraction.");
    return NextResponse.json(
      { error: "Non autorisé. Jeton vide." },
      { status: 401 },
    );
  }

  try {
    // 2. Vérification du jeton Firebase Admin
    const decodedToken = await adminAuth.verifyIdToken(token);

    // 3. Vérification des droits Administrateur dans Firestore
    const callerDoc = await adminDb
      .collection("users")
      .doc(decodedToken.uid)
      .get();

    if (!callerDoc.exists) {
      console.error(
        `[VERIFY_ADMIN] Utilisateur introuvable dans Firestore : ${decodedToken.uid}`,
      );
      return NextResponse.json(
        { error: "Accès refusé. Profil utilisateur introuvable." },
        { status: 403 },
      );
    }

    const callerData = callerDoc.data();
    const role = (
      callerData?.responsability ||
      callerData?.role ||
      ""
    ).toLowerCase();

    if (role !== "administrateur" && role !== "admin") {
      console.error(
        `[VERIFY_ADMIN] Droits insuffisants pour l'UID ${decodedToken.uid}. Rôle détecté: "${role}"`,
      );
      return NextResponse.json(
        { error: "Accès refusé. Droits Administrateur requis." },
        { status: 403 },
      );
    }

    return {
      uid: decodedToken.uid,
      userDoc: callerDoc,
    };
  } catch (error: any) {
    console.error(
      "[VERIFY_ADMIN_ERROR] Erreur lors de la vérification du jeton :",
      error.message || error,
    );
    return NextResponse.json(
      {
        error: `Jeton invalide ou expiré: ${error.message || "Erreur interne"}`,
      },
      { status: 401 },
    );
  }
}
