import { auth } from "@/lib/firebase/firebase";
import { PointOfSaleData } from "@/types/pointOfSale";

export interface PaginatedPOSResponse {
  success: boolean;
  data: PointOfSaleData[];
  pagination: {
    hasMore: boolean;
    lastId: string | null;
  };
  stats?: {
    total: number;
  };
  error?: string;
}

export async function fetchPointsOfSale(
  limit: number = 6,
  lastId?: string | null,
): Promise<PaginatedPOSResponse> {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error("Vous devez être connecté pour effectuer cette action.");
  }

  const token = await currentUser.getIdToken(true);

  const params = new URLSearchParams();
  params.append("limit", limit.toString());
  if (lastId) params.append("lastId", lastId);

  try {
    const response = await fetch(
      `/api/point-of-sale/get-pos?${params.toString()}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(
        result.error || "Impossible de récupérer les points de vente.",
      );
    }

    return result;
  } catch (error: any) {
    console.error("Erreur service fetchPointsOfSale :", error);
    throw error;
  }
}
