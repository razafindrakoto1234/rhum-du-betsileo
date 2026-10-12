import { adminDb } from "@/lib/firebase/firebaseAdmin";
import { NextResponse } from "next/server";

export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const POSId = body.idPOS || body.POSId;

    if (!POSId) {
      return NextResponse.json(
        { error: "L'identifiant du point de vente (POSId) est requis." },
        { status: 400 },
      );
    }

    await adminDb.collection("pointsOfSale").doc(POSId).delete();

    return NextResponse.json(
      { message: "Point de vente supprimé avec succès." },
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
