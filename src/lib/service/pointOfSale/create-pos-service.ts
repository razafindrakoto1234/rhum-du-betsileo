import { auth } from "@/lib/firebase/firebase";
import { CreatePointOfSaleInput, PointOfSaleData } from "@/types/pointOfSale";

export async function createPointOfSale(
  input: CreatePointOfSaleInput,
): Promise<{ success: boolean; message?: string; data?: PointOfSaleData }> {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error("Vous n'êtes pas connecté. Veuillez vous reconnecter.");
  }

  const token = await currentUser.getIdToken(true);

  try {
    const response = await fetch("/api/point-of-sale/create-pos", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(input),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.message ||
          result.error ||
          "Erreur lors de la création du point de vente.",
      );
    }

    return result;
  } catch (error: any) {
    console.error("Erreur service createPointOfSale :", error);
    throw error;
  }
}
