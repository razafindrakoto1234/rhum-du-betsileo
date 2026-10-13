import { ProductData } from "./product";
import { ProductCapacityData } from "./productCapacity";
import { UserData } from "./user";

export type PointOfSaleStatus = "ACTIVE" | "INACTIVE";

export interface PointOfSaleStockData{
  idPOSStock?: string;
  idPOS: string;
  idProduct: string;
  idCapacity: string;
  cartonQuantity: number;
  bottleQuantity: number;
  totalBottles?: number;
  minThreshold?: number;
  capacityDetails?: ProductCapacityData;
  productDetails?: ProductData;
  updatedAt?: string;
}

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