import { auth } from "@/lib/firebase/firebase";

export interface CreateUserData {
  name: string;
  smartphone: string;
  mail: string;
  password?: string;
  responsability: string;
  image?: string;
}

export async function createSimpleUser(
  userData: CreateUserData,
): Promise<{ success: boolean; uid: string }> {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error("Vous n'êtes pas connecté. Veuillez vous reconnecter.");
  }

  const token = await currentUser.getIdToken();

  const formattedPhone =
    userData.smartphone && userData.smartphone.trim() !== ""
      ? userData.smartphone.trim()
      : undefined;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch("/api/admin/create-user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        displayName: userData.name,
        email: userData.mail.trim().toLowerCase(),
        password: userData.password,
        phoneNumber: formattedPhone,
        photoURL: userData.image,
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
        `Erreur serveur (${response.status}) : Réponse non valide du serveur.`,
      );
    }

    if (!response.ok) {
      throw new Error(data.error || "Échec de la création de l'agent.");
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
