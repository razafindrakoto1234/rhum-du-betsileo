import { WarehouseStockData } from "@/types/warehouse";

export interface GetStockResponse {
  success: boolean;
  stocks: WarehouseStockData[];
  message?: string;
  error?: string;
}

export async function getStock(warehouseId: string): Promise<GetStockResponse> {
  try {
    const response = await fetch(
      `/api/stock/get-stock?warehouseId=${warehouseId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || data.error || "Erreur lors de la récupération du stock",
      );
    }

    return data;
  } catch (error: any) {
    console.error("Erreur dans getStock service :", error);
    throw error;
  }
}
