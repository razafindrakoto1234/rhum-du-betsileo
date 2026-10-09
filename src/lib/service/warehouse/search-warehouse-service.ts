import { auth } from "@/lib/firebase/firebase";
import { WarehouseData } from "@/types/warehouse";

export interface SearchWarehousesResponse {
  success: boolean;
  data: WarehouseData[];
  error?: string;
}

export async function searchWarehouse(
  searchTerm: string,
): Promise<SearchWarehousesResponse> {
  const token = await auth.currentUser?.getIdToken();

  const response = await fetch(
    `api/warehouse/search-warehouses?q=${encodeURIComponent(searchTerm)}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  const data: SearchWarehousesResponse = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Erreur lors de la recherche des entrepôts");
  }

  return data;
}
