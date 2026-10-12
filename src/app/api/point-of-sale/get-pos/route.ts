import { verifyAdminRequest } from "@/lib/auth/verify-admin";
import { adminDb } from "@/lib/firebase/firebaseAdmin";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    // 1. Vérification des droits administrateur
    const authResult = await verifyAdminRequest(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    // 2. Extraction des paramètres de pagination (ex: limit=6 par défaut)
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "6", 10);
    const lastId = searchParams.get("lastId");

    let query = adminDb
      .collection("pointsOfSale")
      .orderBy("createdAt", "desc")
      .limit(limit + 1); // +1 pour savoir s'il y a une page suivante

    if (lastId) {
      const lastDoc = await adminDb
        .collection("pointsOfSale")
        .doc(lastId)
        .get();
      if (lastDoc.exists) {
        query = query.startAfter(lastDoc);
      }
    }

    const snapshot = await query.get();
    const docs = snapshot.docs;

    const hasMore = docs.length > limit;
    const visibleDocs = hasMore ? docs.slice(0, limit) : docs;

    const pointsOfSale = visibleDocs.map((doc) => ({
      idPOS: doc.id,
      ...doc.data(),
    }));

    const newLastId =
      visibleDocs.length > 0 ? visibleDocs[visibleDocs.length - 1].id : null;

    // Récupération du total pour l'affichage des stats si besoin
    const totalSnap = await adminDb.collection("pointsOfSale").count().get();

    return NextResponse.json({
      success: true,
      data: pointsOfSale,
      pagination: {
        hasMore,
        lastId: newLastId,
      },
      stats: {
        total: totalSnap.data().count,
      },
    });
  } catch (error: any) {
    console.error("Erreur API get-pos :", error);
    return NextResponse.json(
      { success: false, error: error.message || "Erreur serveur." },
      { status: 500 },
    );
  }
}
