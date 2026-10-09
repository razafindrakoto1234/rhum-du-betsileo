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
    const limit = parseInt(searchParams.get("limit") || "3", 10);
    const lastId = searchParams.get("lastId");

    let listQuery = adminDb
      .collection("warehouses")
      .orderBy("createdAt", "desc")
      .limit(limit + 1);

    if (lastId) {
      const lastDoc = await adminDb.collection("warehouses").doc(lastId).get();
      if (lastDoc.exists) {
        listQuery = listQuery.startAfter(lastDoc);
      }
    }

    const [snapshot, totalSnap] = await Promise.all([
      listQuery.get(),
      adminDb.collection("warehouses").count().get(),
    ]);

    const docs = snapshot.docs;
    const hasMore = docs.length > limit;
    const visibleDocs = hasMore ? docs.slice(0, limit) : docs;

    const warehouses: WarehouseData[] = visibleDocs.map((doc) => {
      const data = doc.data();

      return {
        idWarehouse: doc.id,
        name: data.name || "",
        location: data.location || "",
        capacityMax: Number(data.capacityMax) || 0,
        status: data.status || "INACTIVE",
        createdAt: data.createdAt?.toDate
          ? data.createdAt.toDate().toISOString()
          : data.createdAt || new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate
          ? data.updatedAt.toDate().toISOString()
          : data.updatedAt || new Date().toISOString(),
      } as WarehouseData;
    });

    let activeCount = 0;
    let fullCount = 0;
    let inactiveCount = 0;

    const allWarehouseSnap = await adminDb.collection("warehouses").get();
    allWarehouseSnap.docs.forEach((doc) => {
      const status = doc.data().status;
      if (status === "ACTIVE") {
        activeCount++;
      } else if (status === "FULL") {
        fullCount++;
      } else {
        inactiveCount++;
      }
    });

    // Correction de la condition visibleDocs.length
    const newLastId =
      visibleDocs.length > 0 ? visibleDocs[visibleDocs.length - 1].id : null;

    return NextResponse.json({
      success: true,
      data: warehouses,
      pagination: {
        hasMore,
        lastId: newLastId,
      },
      stats: {
        total: totalSnap.data().count,
        active: activeCount,
        full: fullCount,
        inactive: inactiveCount,
      },
    });
  } catch (error: unknown) {
    console.error("Erreur GET /api/warehouse/get-warehouse :", error);
    const err = error as Error;

    return NextResponse.json(
      {
        success: false,
        error: err.message || "Impossible de récupérer les dépôts.",
      },
      { status: 500 },
    );
  }
}
