export interface UpdateStockPayload {
  idWarehouse: string;
  idProduct: string;
  idCapacity: string;
  cartonQuantity: number;
  bottleQuantity: number;
}

export async function updateStock(payload: UpdateStockPayload) {
  try {
    const response = await fetch("/api/stock/update-stock", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || data.error || "Erreur lors de la modification du stock",
      );
    }

    return data;
  } catch (error: any) {
    console.error("Erreur dans updateStock service :", error);
    throw error;
  }
}
