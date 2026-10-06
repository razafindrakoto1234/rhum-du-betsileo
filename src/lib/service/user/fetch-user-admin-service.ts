import { UserData } from "@/types/user";

export async function fetchApprovedAdmins(): Promise<UserData[]> {
  const response = await fetch("/api/admin/fetch-user-admin", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store", // Pour toujours récupérer la liste à jour
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(
      result.message || "Impossible de charger la liste des administrateurs.",
    );
  }

  return result.data as UserData[];
}
