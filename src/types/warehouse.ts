import { ProductData } from "./product";
import { ProductCapacityData } from "./productCapacity";

export type WarehouseStatus = "ACTIVE" | "INACTIVE" | "FULL";

export interface WarehouseStockData {
  idStock?: string;
  idWarehouse: string;
  idProduct: string;
  idCapacity: string;
  quantity: number;
  minThreshold?: number;
  capacityDetails?: ProductCapacityData;
  productDetails?: ProductData;
  updatedAt?: string;
}

export interface WarehouseData {
  idWarehouse: string;
  name: string; // ex: "Dépôt Principal - Ambalavao", "Cave de Maturation"
  location?: string;
  capacityMax?: number; // Capacité maximale de stockage (en volume/palettes)
  status: WarehouseStatus;
  stocks?: WarehouseStockData[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateWarehouseInput {
  name: string;
  location?: string;
  capacityMax?: number;
  status?: WarehouseStatus;
}
