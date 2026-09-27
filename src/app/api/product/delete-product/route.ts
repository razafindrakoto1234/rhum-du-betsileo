import { verifyAdminRequest } from "@/lib/auth/verify-admin";
import { adminDb } from "@/lib/firebase/firebaseAdmin";
import { NextResponse } from "next/server";

export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const productId = body.productId || body.idProduct;

    if (!productId) {
      return NextResponse.json(
        { error: "L'identifiant du produit (productId) est requis." },
        { status: 400 },
      );
    }

    await adminDb.collection("products").doc(productId).delete();

    return NextResponse.json(
      { message: "Produit supprimé avec succès." },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Erreur serveur lors de la suppression :", error);
    return NextResponse.json(
      { error: error.message || "Erreur lors de la suppression." },
      { status: 500 },
    );
  }
}
