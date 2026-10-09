import { adminDb } from "@/lib/firebase/firebaseAdmin";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const warehouseId = searchParams.get("warehouseId");

    if (!warehouseId) {
      return NextResponse.json(
        {
          success: false,
          message: "Le paramètre warehouseId est obligatoire.",
        },
        { status: 400 },
      );
    }

    // Récupération de tous les stocks correspondant à cet entrepôt dans Firestore
    const snapshot = await adminDb
      .collection("stocks")
      .where("idWarehouse", "==", warehouseId)
      .get();

    const stocks = snapshot.docs.map((doc) => ({
      idStock: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({
      success: true,
      stocks,
    });
  } catch (error: any) {
    console.error("Erreur API GET /api/stock/get-stock :", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error.message ||
          "Erreur serveur lors de la récupération du stock de l'entrepôt.",
      },
      { status: 500 },
    );
  }
}
