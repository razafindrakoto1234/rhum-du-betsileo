export interface DeleteWarehouseData {
  idWarehouse: string;
}

export async function deleteWarehouse(
  data: DeleteWarehouseData,
): Promise<void> {
  const response = await fetch("/api/warehouse/delete-warehouse", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.error || "Erreur lors de la suppression du produit.",
    );
  }
}
