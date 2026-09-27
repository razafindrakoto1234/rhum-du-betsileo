export type ProductStatus = "AVAILABLE" | "OUT_OF_STOCK" | "DISCONTINUED";

export interface ProductData {
  idProduct: string;
  name: string;
  capacity: string;
  description?: string;
  price: number;
  status: ProductStatus;
  imageURL?: string;
  qrCode?: string;
  createdAt?: string;
  updatedAt?: string;
}
export interface CreateProductInput {
  name: string;
  description?: string;
  price: number;
  status?: ProductStatus;
  imageURL?: string;
  qrCode?: string;
}

export interface CreateProductResponse {
  success: boolean;
  message?: string;
  data?: ProductData;
}
