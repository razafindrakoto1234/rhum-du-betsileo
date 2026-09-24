export interface DeleteUserData {
  userId: string;
}

export async function deleteUser(data: DeleteUserData): Promise<void> {
  const response = await fetch("api/admin/delete-user", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.error || "Erreur lors de la suppression de l'utilisateur.",
    );
  }
}
