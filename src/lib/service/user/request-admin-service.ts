export interface RequestAdminData {
  name: string;
  smartphone: string;
  mail: string;
  password?: string;
}

export async function requestAdminService(
  userData: RequestAdminData,
): Promise<{ success: boolean; uid: string }> {
  const formattedPhone =
    userData.smartphone && userData.smartphone.trim() !== ""
      ? userData.smartphone.trim()
      : undefined;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch("/api/admin/request-admin", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        displayName: userData.name,
        email: userData.mail.trim().toLowerCase(),
        password: userData.password,
        phoneNumber: formattedPhone,
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
        `Erreur serveur (${response.status}) : Réponse invalide du serveur.`,
      );
    }

    if (!response.ok) {
      throw new Error(
        data.error || "Échec de l'envoi de la demande d'administration.",
      );
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
