import { auth } from "@/lib/firebase/firebase";
import { PointOfSaleData } from "@/types/pointOfSale";

export interface SearchPOSResponse {
  success: boolean;
  data: PointOfSaleData[];
  error?: string;
}

export async function searchPOS(
  searchTerm: string,
): Promise<SearchPOSResponse> {
  const token = await auth.currentUser?.getIdToken();

  const response = await fetch(
    `api/point-of-sale/search-pos?q=${encodeURIComponent(searchTerm)}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  const data: SearchPOSResponse = await response.json();

  if (!response.ok) {
    throw new Error(
      data.error || "Erreur lors de la recherche des points de ventes",
    );
  }

  return data;
}
