import { auth } from "@/lib/firebase/firebase";
import { ProductData } from "@/types/product";

export interface SearchProductResponse {
  success: boolean;
  data: ProductData[];
  error?: string;
}

export async function searchProduct(
  searchTerm: string,
): Promise<SearchProductResponse> {
  const token = await auth.currentUser?.getIdToken();

  const response = await fetch(
    `/api/product/search-products?q=${encodeURIComponent(searchTerm)}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  const data: SearchProductResponse = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Erreur lors de la recherche des produits.");
  }

  return data;
}
