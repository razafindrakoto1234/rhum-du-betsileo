export type UserRole = "Administrateur" | "Simple";

export interface UserProfile {
  uid: string;
  email: string;
  name?: string;
  responsability: UserRole;
  createdAt?: string;
}

export interface AuthState {
  isLoading: boolean;
  error: string | null;
}
