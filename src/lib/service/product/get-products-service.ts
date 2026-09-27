import { auth } from "@/lib/firebase/firebase";

export interface ProductData {
  id: string;
  name: string;
  capacity?: string;
  description?: string;
  price: number;
  status: "AVAILABLE" | "OUT_OF_STOCK" | "DISCONTINUED";
  imageURL?: string;
  qrCode?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PaginatedProductsResponse {
  success: boolean;
  data: ProductData[];
  pagination: {
    hasMore: boolean;
    lastId: string | null;
  };
  stats?: {
    total: number;
    available: number;
    outOfStock: number;
    discontinued: number;
  };
  error?: string;
}

export async function getProducts(
  limit?: number,
  lastId?: string | null,
): Promise<PaginatedProductsResponse> {
  const currentUser = auth.currentUser;

  if (!currentUser) {
    throw new Error("Vous devez être connecté pour effectuer cette action.");
  }

  const token = await currentUser.getIdToken();

  const params = new URLSearchParams();
  if (limit) params.append("limit", limit.toString());
  if (lastId) params.append("lastId", lastId);

  const queryString = params.toString();
  const url = `/api/product/get-products${queryString ? `?${queryString}` : ""}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(
      result.error || "Impossible de récupérer la liste des produits.",
    );
  }

  return result;
}
