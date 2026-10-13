import { adminDb } from "@/lib/firebase/firebaseAdmin";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    try {
      const { searchParams } = new URL(req.url);
      const idPOS = searchParams.get("idPOS");

      if (!idPOS) {
        return NextResponse.json(
          {
            success: false,
            message: "Le paramètre idPOS est obligatoire.",
          },
          { status: 400 },
        );
      }

      const snapshot = await adminDb
        .collection("POSStocks")
        .where("idPOS", "==", idPOS)
        .get();

      const POSStocks = snapshot.docs.map((doc) => ({
        idPOSStock: doc.id,
        ...doc.data(),
      }));

      return NextResponse.json({
        success: true,
        POSStocks,
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