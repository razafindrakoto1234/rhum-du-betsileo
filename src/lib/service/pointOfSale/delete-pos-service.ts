export interface DeletePOSData {
  idPOS: string;
}

export async function deletePOS(data: DeletePOSData): Promise<void> {
  const response = await fetch("/api/point-of-sale/delete-pos", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.error || "Erreur lors de la suppression du point de vente.",
    );
  }
}
