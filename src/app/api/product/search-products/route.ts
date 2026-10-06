import { verifyAdminRequest } from "@/lib/auth/verify-admin";
import { adminDb } from "@/lib/firebase/firebaseAdmin";
import { ProductCapacityData } from "@/types/productCapacity";
import { ProductData } from "@/types/product";
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

      // Extraction sécurisée des capacités
      const capacities: ProductCapacityData[] = Array.isArray(data.capacities)
        ? data.capacities
        : [];

      // Vérifier si la recherche correspond au nom, à la description ou à l'une des capacités
      const hasMatchingCapacity = capacities.some((c) =>
        (c.capacity || "").toLowerCase().includes(query),
      );

      const isMatch =
        name.includes(query) ||
        description.includes(query) ||
        hasMatchingCapacity;

      if (isMatch) {
        matchingProducts.push({
          idProduct: doc.id,
          name: data.name || "",
          description: data.description || "",
          imageURL: data.imageURL || "",
          capacities: capacities,
          createdAt: data.createdAt?.toDate
            ? data.createdAt.toDate().toISOString()
            : new Date().toISOString(),
          updatedAt: data.updatedAt?.toDate
            ? data.updatedAt.toDate().toISOString()
            : undefined,
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
