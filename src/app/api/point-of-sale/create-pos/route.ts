import { verifyAdminRequest } from "@/lib/auth/verify-admin";
import { adminDb } from "@/lib/firebase/firebaseAdmin";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    // 1. Vérification des droits administrateur
    const authResult = await verifyAdminRequest(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    // 2. Extraction des données
    const body = await request.json();
    const { name, location, idUser, status } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, error: "Le nom du point de vente est obligatoire." },
        { status: 400 },
      );
    }

    // 3. Génération du document Firestore
    const posRef = adminDb.collection("pointsOfSale").doc();
    const idPOS = posRef.id;

    const posData = {
      idPOS,
      name: name.trim(),
      location: location ? location.trim() : "",
      idUser: idUser || null,
      status: status || "ACTIVE",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await posRef.set(posData);

    return NextResponse.json({
      success: true,
      message: "Point de vente créé avec succès.",
      data: posData,
    });
  } catch (error: any) {
    console.error("Erreur API create-pos :", error);
    return NextResponse.json(
      { success: false, error: error.message || "Erreur serveur." },
      { status: 500 },
    );
  }
}
