import { verifyAdminRequest } from "@/lib/auth/verify-admin";
import { adminDb } from "@/lib/firebase/firebaseAdmin";
import { WarehouseData } from "@/types/warehouse";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const authResult = await verifyAdminRequest(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.trim().toLowerCase() || "";

    if (!query) {
      return NextResponse.json({ success: true, data: [] });
    }

    const snapshot = await adminDb.collection("warehouses").get();
    const matchingWarehouses: WarehouseData[] = [];

    snapshot.docs.forEach((doc) => {
      const data = doc.data();

      const name = (data.name || "").toLowerCase();
      const location = (data.location || "").toLowerCase();

      const isMatch = name.includes(query) || location.includes(query);

      if (isMatch) {
        matchingWarehouses.push({
          idWarehouse: doc.id,
          name: data.name || "",
          location: data.location || "",
          status: data.status || false,
        });
      }
    });

    const limitedResults = matchingWarehouses.slice(0, 20);

    return NextResponse.json({
      success: true,
      data: limitedResults,
    });
  } catch (error: any) {
    console.error("Erreur API search-warehouse : ", error);
    return NextResponse.json(
      {
        error: error.message || "Erreur lors de la recherche des Entrepôts.",
      },
      { status: 500 },
    );
  }
}
