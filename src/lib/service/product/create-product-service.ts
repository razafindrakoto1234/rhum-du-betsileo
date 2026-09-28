import { auth } from "@/lib/firebase/firebase";
import { CreateProductInput, CreateProductResponse } from "@/types/product";

export async function createProduct(
  productData: CreateProductInput,
): Promise<CreateProductResponse> {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error("Vous n'êtes pas connecté. Veuillez vous reconnecter.");
  }

  const token = await currentUser.getIdToken(true);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    // Note: Utilisation du slash initial '/' pour un chemin absolu sécurisé
    const response = await fetch("/api/product/create-product", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: productData.name,
        description: productData.description,
        imageURL: productData.imageURL,
        capacities: productData.capacities, // Transmet la liste des capacités
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
      throw new Error(data.error || "Échec de la création du produit.");
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
