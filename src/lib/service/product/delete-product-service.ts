export interface DeleteProductData {
  productId: string;
}

export async function deleteProduct(data: DeleteProductData): Promise<void> {
  const response = await fetch("/api/product/delete-product", {
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
