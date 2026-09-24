import { Timestamp } from "firebase/firestore";

export type FirestoreDate = Date | Timestamp | string;

export interface User {
  idUser?: string;
  name: string;
  smartphone: string;
  mail: string;
  password?: string;
  responsability: string;
  image?: string;
}

export interface Warehouse {
  idWarehouse?: string;
  name: string;
  localisation: string;
}

export interface PointSale {
  idPointSale?: string;
  name: string;
  localisation: string;
  idUser?: string;
}

export interface Stock {
  idStock?: string;
  quantity: number;
  idPointSale?: string;
  idProduct: string;
}

export interface Product {
  idProduct?: string;
  name: string;
  price: number;
  status: string;
  description: string;
  qrCode: string;
}

export interface DeliveryTransfer {
  idTransfer?: string;
  shippingDate: FirestoreDate;
  receptionDate: FirestoreDate;
  status: string;
  idWarehouse: string;
  idPointSale: string;
}

export interface TransferItem {
  idItem?: string;
  sentQuantity: number;
  receiveQuantity: number;
  hasAnomaly: boolean;
  anomalyNote?: string;
  idTransfer: string;
  idProduct: string;
}

export interface Cart {
  idCart?: string;
  quantity: number;
  totalPrice: number;
  type: string;
  idProduct: string;
  idSale?: string;
}

export interface Sale {
  idSale?: string;
  datetimes: FirestoreDate;
  cartIds?: string[];
}

export interface Invoice {
  idInvoice?: string;
  datetime: FirestoreDate;
  totalPrice: number;
  idSale: string;
}
