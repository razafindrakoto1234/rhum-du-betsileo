export type UserResponsability = "Administrateur" | "Simple";

export interface UserData {
  idUser: string;
  name: string;
  mail: string;
  smartphone: string;
  photoURL?: string;
  responsability: UserResponsability;
  createdAt: string;
}

export interface ApiResponse<T = any> {
  success?: boolean;
  error?: string;
  data?: T;
}
