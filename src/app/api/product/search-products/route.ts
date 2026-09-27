import { verifyAdminRequest } from "@/lib/auth/verify-admin";
import { adminDb } from "@/lib/firebase/firebaseAdmin";
import { ProductData } from "@/lib/service/product/get-products-service";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    // 1. Vérification d'authentification et de rôle Admin
    const authResult = await verifyAdminRequest(request);
    if (authResult instanceof NextResponse) {
      return authResult; // Renvoie directement la réponse 401 ou 403
    }

    // 2. Récupération du terme de recherche
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.trim().toLowerCase() || "";

    if (!query) {
      return NextResponse.json({ success: true, data: [] });
    }

    // 3. Récupération et filtrage des produits
    const snapshot = await adminDb.collection("products").get();
    const matchingProducts: ProductData[] = [];

    snapshot.docs.forEach((doc) => {
      const data = doc.data();

      const name = (data.name || "").toLowerCase();
      const description = (data.description || "").toLowerCase();
      const capacity = (data.capacity || "").toLowerCase();

      const isMatch =
        name.includes(query) ||
        description.includes(query) ||
        capacity.includes(query);

      if (isMatch) {
        matchingProducts.push({
          id: doc.id,
          name: data.name || "",
          description: data.description || "",
          price: data.price || 0,
          capacity: data.capacity || "",
          imageURL: data.imageURL || "",
          status: data.status || "AVAILABLE",
          createdAt: data.createdAt?.toDate
            ? data.createdAt.toDate().toISOString()
            : new Date().toISOString(),
        });
      }
    });

    const limitedResults = matchingProducts.slice(0, 20);

    return NextResponse.json({
      success: true,
      data: limitedResults,
    });
  } catch (error: any) {
    console.error("Erreur API search-products : ", error);
    return NextResponse.json(
      {
        error: error.message || "Erreur lors de la recherche des produits.",
      },
      { status: 500 },
    );
  }
}
