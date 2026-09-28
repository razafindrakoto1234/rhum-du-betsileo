import { ProductCapacityData } from "./productCapacity";


export interface ProductData {
  idProduct: string;
  name: string;
  description?: string;
  imageURL?: string;
  capacities: ProductCapacityData[]
  createdAt?: string;
  updatedAt?: string;
}
export interface CreateProductInput {
  name: string;
  description?: string;
  imageURL?: string;
  capacities: ProductCapacityData[];
}

export interface CreateProductResponse {
  success: boolean;
  message?: string;
  data?: ProductData;
}
