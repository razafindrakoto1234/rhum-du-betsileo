import { verifyAdminRequest } from "@/lib/auth/verify-admin";
import { adminDb } from "@/lib/firebase/firebaseAdmin";
import { NextResponse } from "next/server";

export async function PUT(request: Request) {
  try {
    // Vérification du jeton dans l'en-tête Authorization
    const authResult = await verifyAdminRequest(request);
    if (authResult instanceof NextResponse) {
      return authResult; // Renvoie directement la réponse 401 ou 403
    }

    const body = await request.json();
    const { idProduct, name, description, capacities, imageURL } = body;

    if (!idProduct) {
      return NextResponse.json(
        { error: "L'identifiant du produit (idProduct) est obligatoire." },
        { status: 400 },
      );
    }

    if (!name || !Array.isArray(capacities) || capacities.length === 0) {
      return NextResponse.json(
        { error: "Le nom et au moins une capacité sont obligatoires." },
        { status: 400 },
      );
    }

    // Validation des éléments de la liste des capacités
    for (let i = 0; i < capacities.length; i++) {
      const cap = capacities[i];
      if (!cap.capacity || cap.price === undefined || cap.price < 0) {
        return NextResponse.json(
          {
            error: `La capacité #${i + 1} doit posséder une contenance valide et un prix positif.`,
          },
          { status: 400 },
        );
      }
    }

    // Vérification de l'existence du produit dans Firestore
    const productRef = adminDb.collection("products").doc(idProduct);
    const existingDoc = await productRef.get();

    if (!existingDoc.exists) {
      return NextResponse.json(
        { error: "Produit introuvable" },
        { status: 404 },
      );
    }

    // Formatage des capacités nettoyées
    const formattedCapacities = capacities.map((cap: any) => ({
      capacity: String(cap.capacity).trim(),
      price: Number(cap.price),
      status: cap.status || "AVAILABLE",
    }));

    // Objet de mise à jour Firestore
    const updateData = {
      name: name.trim(),
      description: description ? description.trim() : "",
      capacities: formattedCapacities,
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
