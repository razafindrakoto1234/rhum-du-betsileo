import { verifyAdminRequest } from "@/lib/auth/verify-admin";
import { adminDb } from "@/lib/firebase/firebaseAdmin";
import { ProductCapacityData } from "@/types/productCapacity";
import { NextResponse } from "next/server";

export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    // 1. Vérification des droits administrateur
    const authResult = await verifyAdminRequest(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    // 2. Extraction des données
    const { name, description, imageURL, capacities } = await request.json();

    // Validations de base du produit parent
    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "Le nom du produit est obligatoire." },
        { status: 400 },
      );
    }

    if (!Array.isArray(capacities) || capacities.length === 0) {
      return NextResponse.json(
        { error: "Au moins une capacité doit être ajoutée au produit." },
        { status: 400 },
      );
    }

    // 3. Validation et formatage du tableau de capacités
    const formattedCapacities: ProductCapacityData[] = [];

    for (let i = 0; i < capacities.length; i++) {
      const cap = capacities[i];

      if (!cap.capacity || !cap.capacity.trim()) {
        return NextResponse.json(
          { error: `La capacité #${i + 1} doit avoir un libellé (ex: '1L').` },
          { status: 400 },
        );
      }

      const numericPrice = Number(cap.price);
      if (isNaN(numericPrice) || numericPrice < 0) {
        return NextResponse.json(
          {
            error: `Le prix de la capacité '${cap.capacity}' doit être un nombre valide positif.`,
          },
          { status: 400 },
        );
      }

      // Génération d'un ID unique pour chaque capacité si non fourni
      const capacityId =
        cap.idCapacity || adminDb.collection("products").doc().id;

      formattedCapacities.push({
        idCapacity: capacityId,
        capacity: cap.capacity.trim(),
        price: numericPrice,
        status: cap.status || "AVAILABLE",
      });
    }

    // 4. Génération du document produit dans Firestore
    const productRef = adminDb.collection("products").doc();

    const productData = {
      idProduct: productRef.id,
      name: name.trim(),
      description: description ? description.trim() : "",
      imageURL: imageURL || "",
      capacities: formattedCapacities,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // 5. Sauvegarde dans Firestore
    await productRef.set(productData);

    return NextResponse.json({
      success: true,
      message: "Produit et ses capacités créés avec succès.",
      data: productData,
    });
  } catch (error: any) {
    console.error("Erreur API create-product:", error);

    return NextResponse.json(
      {
        error:
          error.message || "Erreur interne lors de la création du produit.",
      },
      { status: 500 },
    );
  }
}
