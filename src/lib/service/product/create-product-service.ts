import { auth } from "@/lib/firebase/firebase";

export interface CreateProductData {
  name: string;
  capacity: string;
  description?: string;
  price: number;
  status?: "AVAILABLE" | "OUT_OF_STOCK" | "DISCONTINUED";
  imageURL?: string;
  qrCode?: string;
}

export async function createProduct(
  productData: CreateProductData,
): Promise<{ success: boolean; idProduct: string; product: any }> {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error("Vous n'êtes pas connecté. Veuillez vous reconnecter.");
  }

  const token = await currentUser.getIdToken();

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch("api/product/create-product", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: productData.name,
        capacity: productData.capacity,
        description: productData.description,
        price: productData.price,
        status: productData.status || "AVAILABLE",
        imageURL: productData.imageURL,
        qrCode: productData.qrCode,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const text = await response.text();
    let data: any = {};

    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      throw new Error(
        `Erreur serveur (${response.status}): Réponse non valide du serveur.`,
      );
    }

    if (!response.ok) {
      throw new Error(data.error || "Echec de la création du produit.");
    }

    return data;
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === "AbortError") {
      throw new Error(
        "Le serveur met trop de temps à répondre. Vérifiez votre connexion.",
      );
    }
    throw error;
  }
}
