import { PointOfSaleStockData } from "@/types/pointOfSale";

export interface GetPOSStockResponse {
  success: boolean;
  POSStocks: PointOfSaleStockData[];
  message?: string;
  error?: string;
}

export async function getPosStocks(
  idPOS: string,
): Promise<GetPOSStockResponse> {
  try {
    const response = await fetch(`/api/stockPOS/get-stockPOS?idPOS=${idPOS}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message ||
          data.error ||
          "Erreur lors de la récupération du POS stock",
      );
    }

    return data;
  } catch (error: any) {
    console.error("Erreur dans getPosStock service :", error);
    throw error;
  }
}
