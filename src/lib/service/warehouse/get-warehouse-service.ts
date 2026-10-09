import { auth } from "@/lib/firebase/firebase";
import { WarehouseData } from "@/types/warehouse";

export interface PaginatedWarehousesResponse {
  success: boolean;
  data: WarehouseData[];
  pagination: {
    hasMore: boolean;
    lastId: string | null;
  };
  stats?: {
    total: number;
    active: number;
    full: number;
    inactive: number;
  };
  error?: string;
}

export async function getWarehouses(
  limit?: number,
  lastId?: string | null,
): Promise<PaginatedWarehousesResponse> {
  const currentUser = auth.currentUser;

  if (!currentUser) {
    throw new Error("Vous devez être connecté pour effectuer cette action.");
  }

  const token = await currentUser.getIdToken();

  const params = new URLSearchParams();
  if (limit) params.append("limit", limit.toString());
  if (lastId) params.append("lastId", lastId);

  const queryString = params.toString();
  const url = `/api/warehouse/get-warehouse${queryString ? `?${queryString}` : ""}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(
      result.error || "Impossible de récupérer la liste des dépôts.",
    );
  }

  return result;
}
