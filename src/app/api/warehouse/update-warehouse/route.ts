import { verifyAdminRequest } from "@/lib/auth/verify-admin";
import { adminDb } from "@/lib/firebase/firebaseAdmin";
import { NextResponse } from "next/server";

export async function PUT(request: Request) {
  try {
    const authResult = await verifyAdminRequest(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const body = await request.json();
    const { idWarehouse, name, location, capacityMax, status, stocks } = body;

    if (!idWarehouse) {
      return NextResponse.json(
        { error: "L'identifiant de l'entrepôt (idWarehouse) est obligatoire." },
        { status: 400 },
      );
    }

    const warehouseRef = adminDb.collection("warehouses").doc(idWarehouse);
    const existingDoc = await warehouseRef.get();

    if (!existingDoc.exists) {
      return NextResponse.json(
        { error: "Entrepôt introuvable" },
        { status: 404 },
      );
    }

    const updateData = {
      name: name.trim(),
      location: location ? location.trim() : "",
      capacityMax:
        capacityMax !== undefined && capacityMax !== null
          ? Number(capacityMax)
          : 0,
      status: status ? status.trim() : "",
      stocks: stocks ? stocks.trim() : "",
      updatedAt: new Date().toISOString(),
    };

    await warehouseRef.update(updateData);

    return NextResponse.json(
      {
        message: "Entrepôt mis à jour avec succès.",
        warehouse: { idWarehouse, ...updateData },
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Erreur lors de la mise à jour de l'entrepôt: ", error);
    return NextResponse.json(
      {
        error:
          error.message ||
          "Erreur serveur lors de la mise à jour de l'entrepôt.",
      },
      { status: 500 },
    );
  }
}
