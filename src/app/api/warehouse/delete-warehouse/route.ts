import { adminDb } from "@/lib/firebase/firebaseAdmin";
import { NextResponse } from "next/server";

export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const warehouseId =
      body.idWarehouse || body.warehouseID || body.warehouseId;

    if (!warehouseId) {
      return NextResponse.json(
        { error: "L'identifiant de l'entrepôt (warehouseID) est requis." },
        { status: 400 },
      );
    }

    await adminDb.collection("warehouses").doc(warehouseId).delete();

    return NextResponse.json(
      { message: "Entrepôt supprimé avec succès." },
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
