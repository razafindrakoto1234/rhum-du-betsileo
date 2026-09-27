import { verifyAdminRequest } from "@/lib/auth/verify-admin";
import { adminAuth, adminDb } from "@/lib/firebase/firebaseAdmin";
import { UserData } from "@/types/user";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    // 1. Vérification du jeton d'autorisation
    const authResult = await verifyAdminRequest(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    // Paramètres de pagination
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "4", 10);
    const lastId = searchParams.get("lastId");

    // Execution en parallèle :
    // a) La requête de liste avec pagination (limit + 1 pour détecter s'il y a une suite)
    // b) Les aggregations count() sur toute la collection
    let listQuery = adminDb
      .collection("users")
      .orderBy("createdAt", "desc")
      .limit(limit + 1);

    if (lastId) {
      const lastDoc = await adminDb.collection("users").doc(lastId).get();
      if (lastDoc.exists) {
        listQuery = listQuery.startAfter(lastDoc);
      }
    }

    const [snapshot, totalSnap, adminSnap, simpleSnap] = await Promise.all([
      listQuery.get(),
      adminDb.collection("users").count().get(),
      adminDb
        .collection("users")
        .where("responsability", "in", [
          "Administrateur",
          "administrateur",
          "Admin",
          "admin",
        ])
        .count()
        .get(),
      adminDb
        .collection("users")
        .where("responsability", "in", ["Simple", "simple"])
        .count()
        .get(),
    ]);

    const docs = snapshot.docs;
    const hasMore = docs.length > limit;
    const visibleDocs = hasMore ? docs.slice(0, limit) : docs;

    const users: UserData[] = visibleDocs.map((doc) => {
      const data = doc.data();
      return {
        idUser: doc.id,
        name: data.name || "",
        mail: data.mail || "",
        smartphone: data.smartphone || "",
        photoURL: data.photoURL || "",
        responsability: data.responsability || "simple",
        createdAt: data.createdAt?.toDate
          ? data.createdAt.toDate().toISOString()
          : new Date().toISOString(),
      };
    });

    const newLastId =
      visibleDocs.length > 0 ? visibleDocs[visibleDocs.length - 1].id : null;

    return NextResponse.json({
      success: true,
      data: users,
      pagination: { hasMore, lastId: newLastId },
      stats: {
        total: totalSnap.data().count,
        admins: adminSnap.data().count,
        simples: simpleSnap.data().count,
      },
    });
  } catch (error: any) {
    console.error("Erreur serveur API get-users : ", error);
    return NextResponse.json(
      {
        error:
          error.message || "Erreur lors de la récupération des Utilisateurs.",
      },
      { status: 500 },
    );
  }
}
