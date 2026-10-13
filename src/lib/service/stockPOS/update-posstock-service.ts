export interface UpdatePOSStockPayload {
  idPOS: string;
  idProduct: string;
  idCapacity: string;
  cartonQuantity: number;
  bottleQuantity: number;
}

export async function updatePosStock(payload: UpdatePOSStockPayload) {
  try {
    const response = await fetch("/api/stockPOS/update-stockPOS", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message ||
          data.error ||
          "Erreur lors de la modification du pos stock",
      );
    }

    return data;
  } catch (error: any) {
    console.error("Erreur dans updateStock service :", error);
    throw error;
  }
}
