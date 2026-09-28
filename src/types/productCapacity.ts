export type ProductStatus = "AVAILABLE" | "OUT_OF_STOCK" | "DISCONTINUED";

export interface ProductCapacityData {
  idCapacity?: string;
  capacity: string;
  price: number;
  status: ProductStatus;
  qrCode: string;
}

export interface CreateProductCapacityInput {
  capacity: string;
  price: number;
  status?: ProductStatus;
  qrCode?: string;
}
