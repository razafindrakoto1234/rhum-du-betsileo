import { auth } from "@/lib/firebase/firebase";
import { UserData } from "@/types/user";

export interface PaginatedUsersResponse {
  success: boolean;
  data: UserData[];
  pagination: {
    hasMore: boolean;
    lastId: string | null;
  };
  stats?: {
    total: number;
    admins: number;
    simples: number;
  };
  error?: string;
}

export async function getUsers(
  limit?: number,
  lastId?: string | null,
): Promise<PaginatedUsersResponse> {
  const currentUser = auth.currentUser;

  if (!currentUser) {
    throw new Error("Vous devez être connecté pour effectuer cette action.");
  }

  const token = await currentUser.getIdToken();

  const params = new URLSearchParams();
  if (limit) params.append("limit", limit.toString());
  if (lastId) params.append("lastId", lastId);

  const queryString = params.toString();
  const url = `/api/admin/get-users${queryString ? `?${queryString}` : ""}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(
      result.error || "Impossible de récupérer les utilisateurs.",
    );
  }

  return result;
}
