import { verifyAdminRequest } from "@/lib/auth/verify-admin";
import { adminDb } from "@/lib/firebase/firebaseAdmin";
import { UserData } from "@/types/user";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    // 1. Vérification du jeton d'autorisation admin
    const authResult = await verifyAdminRequest(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    // 2. Récupération de tous les utilisateurs sans pagination restrictive
    const snapshot = await adminDb
      .collection("users")
      .orderBy("createdAt", "desc")
      .get();

    const users: UserData[] = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        idUser: doc.id,
        name: data.name || "",
        mail: data.mail || "",
        smartphone: data.smartphone || "",
        photoURL: data.photoURL || "",
        isBlocked: data.isBlocked ?? false,
        responsability: data.responsability || "simple",
        createdAt: data.createdAt?.toDate
          ? data.createdAt.toDate().toISOString()
          : new Date().toISOString(),
      };
    });

    return NextResponse.json({
      success: true,
      data: users,
    });
  } catch (error: any) {
    console.error("Erreur serveur API fetch-user : ", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error.message || "Erreur lors de la récupération des utilisateurs.",
      },
      { status: 500 },
    );
  }
}
