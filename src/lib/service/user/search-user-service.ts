import { auth } from "@/lib/firebase/firebase";
import { UserData } from "@/types/user";

export interface SearchUsersResponse {
  success: boolean;
  data: UserData[];
  error?: string;
}

export async function searchUsers(
  searchTerm: string,
): Promise<SearchUsersResponse> {
  const token = await auth.currentUser?.getIdToken();

  const response = await fetch(
    `api/admin/search-users?q=${encodeURIComponent(searchTerm)}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  const data: SearchUsersResponse = await response.json();

  if (!response.ok) {
    throw new Error(
      data.error || "Erreur lors de la recherche des utilisateurs.",
    );
  }

  return data;
}
