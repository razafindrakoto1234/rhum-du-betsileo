import { verifyAdminRequest } from "@/lib/auth/verify-admin";
import { adminDb } from "@/lib/firebase/firebaseAdmin";
import { ProductData } from "@/types/product";
import { ProductCapacityData } from "@/types/productCapacity";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    // 1. Vérification des privilèges
    const authResult = await verifyAdminRequest(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    // 2. Extraction des paramètres de pagination
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "6", 10);
    const lastId = searchParams.get("lastId");

    // 3. Construction de la requête Firestore
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

    const [snapshot, totalSnap] = await Promise.all([
      listQuery.get(),
      adminDb.collection("products").count().get(),
    ]);

    const docs = snapshot.docs;
    const hasMore = docs.length > limit;
    const visibleDocs = hasMore ? docs.slice(0, limit) : docs;

    // 4. Mappage vers le nouveau format de données
    const products: ProductData[] = visibleDocs.map((doc) => {
      const data = doc.data();

      // Formatage sécurisé des capacités
      const rawCapacities = Array.isArray(data.capacities)
        ? data.capacities
        : [];
      const capacities: ProductCapacityData[] = rawCapacities.map(
        (cap: any) => ({
          idCapacity: cap.idCapacity || "",
          capacity: cap.capacity || "",
          price: Number(cap.price) || 0,
          status: cap.status || "AVAILABLE",
          qrCode: cap.qrCode || "",
        }),
      );

      return {
        idProduct: doc.id,
        name: data.name || "",
        description: data.description || "",
        imageURL: data.imageURL || "",
        capacities,
        createdAt: data.createdAt?.toDate
          ? data.createdAt.toDate().toISOString()
          : data.createdAt || new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate
          ? data.updatedAt.toDate().toISOString()
          : data.updatedAt || new Date().toISOString(),
      };
    });

    // 5. Calcul des statistiques globales sur l'ensemble des produits
    let availableCount = 0;
    let outOfStockCount = 0;
    let discontinuedCount = 0;

    // Récupération globale légère pour les statistiques
    const allProductsSnap = await adminDb.collection("products").get();
    allProductsSnap.docs.forEach((doc) => {
      const pData = doc.data();
      const caps: any[] = Array.isArray(pData.capacities)
        ? pData.capacities
        : [];

      if (caps.some((c) => c.status === "AVAILABLE")) {
        availableCount++;
      } else if (caps.some((c) => c.status === "OUT_OF_STOCK")) {
        outOfStockCount++;
      } else if (
        caps.length > 0 &&
        caps.every((c) => c.status === "DISCONTINUED")
      ) {
        discontinuedCount++;
      }
    });

    const newLastId =
      visibleDocs.length > 0 ? visibleDocs[visibleDocs.length - 1].id : null;

    return NextResponse.json({
      success: true,
      data: products,
      pagination: { hasMore, lastId: newLastId },
      stats: {
        total: totalSnap.data().count,
        available: availableCount,
        outOfStock: outOfStockCount,
        discontinued: discontinuedCount,
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
