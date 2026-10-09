import { auth } from "@/lib/firebase/firebase";
import { CreateWarehouseInput, WarehouseData } from "@/types/warehouse";

export interface CreateWarehouseResponse {
  success: boolean;
  message: string;
  data: WarehouseData;
}

export async function createWarehouse(
  warehouseData: CreateWarehouseInput,
): Promise<CreateWarehouseResponse> {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error("Vous n'êtes pas connecté. Veuillez vous reconnecter.");
  }

  const token = await currentUser.getIdToken(true);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch("/api/warehouse/create-warehouse", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: warehouseData.name,
        location: warehouseData.location,
        capacityMax: warehouseData.capacityMax,
        status: warehouseData.status,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const text = await response.text();
    let data: any = {};

    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      throw new Error(
        `Erreur serveur (${response.status}): Réponse non valide du serveur.`,
      );
    }

    if (!response.ok) {
      throw new Error(data.error || "Échec de la création de l'entrepôt.");
    }

    return data;
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === "AbortError") {
      throw new Error(
        "Le serveur met trop de temps à répondre. Vérifiez votre connexion.",
      );
    }
    throw error;
  }
}
