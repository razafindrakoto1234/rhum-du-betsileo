import { UserData } from "./user";

export type PointOfSaleStatus = "ACTIVE" | "INACTIVE";

export interface PointOfSaleData {
  idPOS: string;
  name: string;
  location?: string;
  status: PointOfSaleStatus;
  idUser?: string;
  userDetails?: UserData;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreatePointOfSaleInput {
  name: string;
  location?: string;
  idUser?: string;
  status?: PointOfSaleStatus;
}

export interface UpdatePointOfSaleInput {
  name?: string;
  location?: string;
  idUser?: string;
  status?: PointOfSaleStatus;
}