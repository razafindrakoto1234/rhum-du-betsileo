import { verifyAdminRequest } from "@/lib/auth/verify-admin";
import { adminDb } from "@/lib/firebase/firebaseAdmin";
import { WarehouseData, WarehouseStatus } from "@/types/warehouse";
import { NextResponse } from "next/server";

export const maxDuration = 60;

const VALID_STATUSES: WarehouseStatus[] = ["ACTIVE", "INACTIVE", "FULL"];

export async function POST(request: Request) {
  try {
    // 1. Vérification de l'authentification et du rôle Administrateur
    const authResult = await verifyAdminRequest(request);
    if (authResult instanceof NextResponse) {
      return authResult; // Renvoie directement la réponse 401 ou 403 en cas d'échec
    }

    // 2. Extraction du corps de la requête
    const { name, location, capacityMax, status } = await request.json();

    // 3. Validation des champs obligatoires
    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "Le nom de l'entrepôt est obligatoire." },
        { status: 400 },
      );
    }

    let parsedCapacityMax: number | undefined = undefined;
    if (capacityMax !== undefined && capacityMax !== null) {
      parsedCapacityMax = Number(capacityMax);
      if (isNaN(parsedCapacityMax) || parsedCapacityMax < 0) {
        return NextResponse.json(
          { error: "La capacité maximale doit être un nombre positif valide." },
          { status: 400 },
        );
      }
    }

    const warehouseStatus: WarehouseStatus = status || "ACTIVE";
    if (!VALID_STATUSES.includes(warehouseStatus)) {
      return NextResponse.json(
        { error: "Le statut de l'entrepôt fourni est invalide." },
        { status: 400 },
      );
    }

    // 4. Génération de la référence dans Firestore
    const warehouseRef = adminDb.collection("warehouses").doc();

    const newWarehouse: WarehouseData = {
      idWarehouse: warehouseRef.id,
      name: name.trim(),
      location: location ? location.trim() : "",
      capacityMax: parsedCapacityMax,
      status: warehouseStatus,
      stocks: [], // Initialisation à vide pour le suivi ultérieur du stock
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // 5. Insertion dans la collection "warehouses"
    await warehouseRef.set(newWarehouse);

    return NextResponse.json({
      success: true,
      message: "Entrepôt créé avec succès.",
      data: newWarehouse,
    });
  } catch (error: any) {
    console.error("Erreur API create-warehouse:", error);

    return NextResponse.json(
      {
        error:
          error.message || "Erreur interne lors de la création de l'entrepôt.",
      },
      { status: 500 },
    );
  }
}
