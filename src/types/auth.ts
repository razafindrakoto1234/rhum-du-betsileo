export type UserRole = "Administrateur" | "Simple";

export type UserStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface UserProfile {
  uid: string;
  email: string;
  name?: string;
  responsability: UserRole;
  status: UserStatus;
  createdAt?: string;
}

export interface AuthState {
  isLoading: boolean;
  error: string | null;
}
