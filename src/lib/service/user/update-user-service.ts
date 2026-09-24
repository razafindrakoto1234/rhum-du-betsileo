export interface UpdateUserData {
  userId: string;
  name?: string;
  smartphone?: string;
  mail?: string;
  image?: string;
}

export async function updateUser(data: UpdateUserData): Promise<void> {
  const response = await fetch("api/admin/update-user", {
    method: "PUT",
    headers: {
      "content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.error || "Erreur lors de la mise à jour de l'utilisateur.",
    );
  }
}
