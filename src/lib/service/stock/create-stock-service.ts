export interface CreateStockPayload {
  idWarehouse: string;
  idProduct: string;
  idCapacity: string;
  cartonQuantity: number;
  bottleQuantity: number;
}

export async function createStock(payload: CreateStockPayload) {
  try {
    const response = await fetch("/api/stock/create-stock", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || data.error || "Erreur lors de la création du stock",
      );
    }

    return data;
  } catch (error: any) {
    console.error("Erreur dans createStock service :", error);
    throw error;
  }
}
