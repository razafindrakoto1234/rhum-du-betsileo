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
    const { idPOS, name, location, idUser, status } = body;

    if (!idPOS) {
      return NextResponse.json(
        {
          success: false,
          error: "L'identifiant du point de vente (idPOS) est requis.",
        },
        { status: 400 },
      );
    }

    if (!name || !name.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: "Le nom du point de vente est obligatoire.",
        },
        { status: 400 },
      );
    }

    const posRef = adminDb.collection("pointsOfSale").doc(idPOS);
    const posDoc = await posRef.get();

    if (!posDoc.exists) {
      return NextResponse.json(
        { success: false, error: "Point de vente introuvable." },
        { status: 404 },
      );
    }
    const updateData: any = {
      name: name.trim(),
      location: location ? location.trim() : "",
      status: status || "ACTIVE",
      updatedAt: new Date().toISOString(),
    };

    if (idUser !== undefined) {
      updateData.idUser = idUser || null;
    }

    await posRef.update(updateData);

    return NextResponse.json({
      success: true,
      message: "Point de vente mis à jour avec succès.",
    });
  } catch (error: any) {
    console.error("Erreur API update-pos :", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Erreur serveur lors de la mise à jour.",
      },
      { status: 500 },
    );
  }
}
