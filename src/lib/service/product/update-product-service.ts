import { auth } from "@/lib/firebase/firebase";

export interface UpdateProductPayload {
  idProduct: string;
  name: string;
  description?: string;
  capacity?: string;
  price: number;
  imageURL?: string;
}

export const updateProductSerice = async (
  payload: UpdateProductPayload,
): Promise<any> => {
  const currentUser = auth.currentUser;

  if (!currentUser) {
    throw new Error("Vous devez être connecté pour effectuer cette action.");
  }

  // Obtenir le jeton d'authentification ID valide
  const idToken = await currentUser.getIdToken();

  const response = await fetch("/api/product/update-product", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Echec de la modification du produit.");
  }

  return data.product;
};
