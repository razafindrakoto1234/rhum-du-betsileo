import { auth } from "@/lib/firebase/firebase";
import { UserData } from "@/types/user";

export async function fetchUsers(): Promise<UserData[]> {
  const currentUser = auth.currentUser;

  if (!currentUser) {
    throw new Error("Vous devez être connecté pour effectuer cette action.");
  }

  const token = await currentUser.getIdToken();

  const response = await fetch("/api/admin/fetch-user", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const text = await response.text();
  let result: any = {};

  try {
    result = text ? JSON.parse(text) : {};
  } catch (e) {
    throw new Error(`Erreur serveur (${response.status}): Réponse non valide.`);
  }

  if (!response.ok || !result.success) {
    throw new Error(
      result.error || "Impossible de récupérer les utilisateurs.",
    );
  }

  return result.data || [];
}
