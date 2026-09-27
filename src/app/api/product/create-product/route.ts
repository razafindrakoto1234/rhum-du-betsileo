import { verifyAdminRequest } from "@/lib/auth/verify-admin";
import { adminAuth, adminDb } from "@/lib/firebase/firebaseAdmin";
import { NextResponse } from "next/server";

export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    // Vérification du token
     const authResult = await verifyAdminRequest(request)
        if (authResult instanceof NextResponse) {
          return authResult
        }

    // Extraction des données
    const { name, capacity, description, price, status, imageURL, qrCode } =
      await request.json();

    if (!name || price === undefined || price === null) {
      return NextResponse.json(
        { error: "Le nom et le prix du produit sont obligatoires." },
        { status: 400 },
      );
    }

    const numericPrice = Number(price);
    if (isNaN(numericPrice) || numericPrice < 0) {
      return NextResponse.json(
        { error: "Le prix doit être un nombre valide positif." },
        { status: 400 },
      );
    }

    // Géneration de la réference du document dans Firestore
    const productRef = adminDb.collection("products").doc();

    const productData = {
      idProduct: productRef.id,
      name: name.trim(),
      capacity: capacity ? capacity.trim() : "",
      description: description ? description.trim() : "",
      price: numericPrice,
      status: status || "AVAILABLE",
      imageURL: imageURL || "",
      qrCode: qrCode ? qrCode.trim() : "",
      createdAt: new Date(),
    };

    // Sauvegarde dans Firestore
    await productRef.set(productData);

    return NextResponse.json({
      success: true,
      idProduct: productRef.id,
      product: productData,
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
