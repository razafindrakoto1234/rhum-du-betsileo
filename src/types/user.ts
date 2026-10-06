export type UserResponsability = "Administrateur" | "Simple";

export type UserStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface UserData {
  idUser: string;
  name: string;
  mail: string;
  smartphone: string;
  photoURL?: string;
  responsability: UserResponsability;
  isBlocked: boolean;
  status?: UserStatus;
  createdAt: string;
}

export interface ApiResponse<T = any> {
  success?: boolean;
  error?: string;
  data?: T;
}
