import { auth } from "@/lib/firebase/firebase";

export interface UpdateWarehousePayload {
  idWarehouse: string;
  name: string;
  location: string;
  capacityMax: number;
  status: string;
  stocks?: string;
}

export const UpdateWarehouseService = async (
  payload: UpdateWarehousePayload,
): Promise<any> => {
  const currentUser = auth.currentUser;

  if (!currentUser) {
    throw new Error("Vous devez être connecté pour effectuer cette action.");
  }

  // Obtenir le jeton d'authentification ID valide
  const idToken = await currentUser.getIdToken();

  const response = await fetch("/api/warehouse/update-warehouse", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Échec de la modification de l'entrepôt.");
  }

  return data.warehouse;
};
