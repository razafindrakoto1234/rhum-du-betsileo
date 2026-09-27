import { verifyAdminRequest } from "@/lib/auth/verify-admin";
import { adminAuth, adminDb } from "@/lib/firebase/firebaseAdmin";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    // 1. Vérification du jeton d'autorisation
    const authResult = await verifyAdminRequest(request)
       if (authResult instanceof NextResponse) {
         return authResult
       }

    // 3. Paramètres de pagination
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "6", 10);
    const lastId = searchParams.get("lastId");

    // 4. Exécution de la liste paginée et des agrégations
    let listQuery = adminDb
      .collection("products")
      .orderBy("createdAt", "desc")
      .limit(limit + 1);

    if (lastId) {
      const lastDoc = await adminDb.collection("products").doc(lastId).get();
      if (lastDoc.exists) {
        listQuery = listQuery.startAfter(lastDoc);
      }
    }

    const [
      snapshot,
      totalSnap,
      availableSnap,
      outOfStockSnap,
      discontinuedSnap,
    ] = await Promise.all([
      listQuery.get(),
      adminDb.collection("products").count().get(),
      adminDb
        .collection("products")
        .where("status", "==", "AVAILABLE")
        .count()
        .get(),
      adminDb
        .collection("products")
        .where("status", "==", "OUT_OF_STOCK")
        .count()
        .get(),
      adminDb
        .collection("products")
        .where("status", "==", "DISCONTINUED")
        .count()
        .get(),
    ]);

    const docs = snapshot.docs;
    const hasMore = docs.length > limit;
    const visibleDocs = hasMore ? docs.slice(0, limit) : docs;

    const products = visibleDocs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name || "",
        capacity: data.capacity || "",
        description: data.description || "",
        price: data.price || 0,
        status: data.status || "AVAILABLE",
        imageURL: data.imageURL || "",
        qrCode: data.qrCode || "",
        createdAt: data.createdAt?.toDate
          ? data.createdAt.toDate().toISOString()
          : new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate
          ? data.updatedAt.toDate().toISOString()
          : new Date().toISOString(),
      };
    });

    const newLastId =
      visibleDocs.length > 0 ? visibleDocs[visibleDocs.length - 1].id : null;

    return NextResponse.json({
      success: true,
      data: products,
      pagination: { hasMore, lastId: newLastId },
      stats: {
        total: totalSnap.data().count,
        available: availableSnap.data().count,
        outOfStock: outOfStockSnap.data().count,
        discontinued: discontinuedSnap.data().count,
      },
    });
  } catch (error: any) {
    console.error("Erreur serveur API get-products :", error);
    return NextResponse.json(
      {
        error: error.message || "Erreur lors de la récupération des produits.",
      },
      { status: 500 },
    );
  }
}
