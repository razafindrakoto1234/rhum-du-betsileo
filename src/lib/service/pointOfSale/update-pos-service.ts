import { auth } from "@/lib/firebase/firebase";
import { PointOfSaleData } from "@/types/pointOfSale";

export interface UpdatePOSResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export async function updatePointOfSale(
  idPOS: string,
  data: Partial<PointOfSaleData>,
): Promise<UpdatePOSResponse> {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error("Vous devez être connecté pour effectuer cette action.");
  }

  const token = await currentUser.getIdToken(true);

  try {
    const response = await fetch("/api/point-of-sale/update-pos", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        idPOS,
        ...data,
      }),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(
        result.error || "Impossible de mettre à jour le point de vente.",
      );
    }

    return result;
  } catch (error: any) {
    console.error("Erreur service updatePointOfSale :", error);
    throw error;
  }
}
