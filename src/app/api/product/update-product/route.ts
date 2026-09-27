import { verifyAdminRequest } from "@/lib/auth/verify-admin";
import { adminDb } from "@/lib/firebase/firebaseAdmin";
import { NextResponse } from "next/server";

export async function PUT(request: Request) {
  try {
    // Vérification du jeton dans l'en-tête Authorization*
    const authResult = await verifyAdminRequest(request);
    if (authResult instanceof NextResponse) {
      return authResult; // Renvoie directement la réponse 401 ou 403
    }

    const body = await request.json();
    const { idProduct, name, description, capacity, price, imageURL } = body;

    if (!idProduct) {
      return NextResponse.json(
        { error: "L'identifiant du produit (idProduit) est obligatoire." },
        { status: 400 },
      );
    }

    if (!name || price === undefined) {
      return NextResponse.json(
        { error: "Le nom et le prix du produit sont obligatoires." },
        { status: 400 },
      );
    }

    // Vérification de l'existence du produit
    const productRef = adminDb.collection("products").doc(idProduct);
    const existingDoc = await productRef.get();

    if (!existingDoc.exists) {
      return NextResponse.json(
        { error: "Produit introuvable" },
        { status: 400 },
      );
    }

    // Mise à jour dans Firestore
    const updateData = {
      name,
      description: description || "",
      capacity: capacity || "",
      price: Number(price),
      ...(imageURL !== undefined && { imageURL }),
      updatedAt: new Date().toISOString(),
    };

    await productRef.update(updateData);

    return NextResponse.json(
      {
        message: "Produit mis à jour avec succès.",
        product: { idProduct, ...updateData },
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Erreur lors de la mise à jour du produit :", error);
    return NextResponse.json(
      {
        error:
          error.message || "Erreur serveur lors de la mise à jour du produit.",
      },
      { status: 500 },
    );
  }
}
