import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";
import {
  Product,
  Warehouse,
  PointSale,
  Stock,
  User,
  DeliveryTransfer,
  Sale,
  TransferItem,
  Invoice,
} from "@/types";
import { db } from "../firebase/firebase";

// ==================== UTILISATEURS (USER) ====================
const userRef = collection(db, "users");

export const getUsers = async (): Promise<User[]> => {
  const snapshot = await getDocs(userRef);
  return snapshot.docs.map(
    (doc) => ({ idUser: doc.id, ...doc.data() }) as User,
  );
};

export const addUser = async (user: Omit<User, "idUser">) => {
  return await addDoc(userRef, user);
};

export const updateUser = async (idUser: string, data: Partial<User>) => {
  return await updateDoc(doc(db, "users", idUser), data);
};

export const deleteUser = async (idUser: string) => {
  return await deleteDoc(doc(db, "users", idUser));
};

// ==================== PRODUITS ====================
const productsRef = collection(db, "products");

export const getProducts = async (): Promise<Product[]> => {
  const snapshot = await getDocs(productsRef);
  return snapshot.docs.map(
    (doc) => ({ idProduct: doc.id, ...doc.data() }) as Product,
  );
};

export const addProduct = async (product: Omit<Product, "idProduct">) => {
  return await addDoc(productsRef, product);
};

export const updateProduct = async (
  idProduct: string,
  data: Partial<Product>,
) => {
  const docRef = doc(db, "products", idProduct);
  return await updateDoc(docRef, data);
};

export const deleteProduct = async (idProduct: string) => {
  const docRef = doc(db, "products", idProduct);
  return await deleteDoc(docRef);
};

// ==================== DÉPÔTS (WAREHOUSE) ====================
const warehousesRef = collection(db, "warehouses");

export const getWarehouses = async (): Promise<Warehouse[]> => {
  const snapshot = await getDocs(warehousesRef);
  return snapshot.docs.map(
    (doc) => ({ idWarehouse: doc.id, ...doc.data() }) as Warehouse,
  );
};

export const addWarehouse = async (
  warehouse: Omit<Warehouse, "idWarehouse">,
) => {
  return await addDoc(warehousesRef, warehouse);
};

export const updateWarehouse = async (
  idWarehouse: string,
  data: Partial<Warehouse>,
) => {
  return await updateDoc(doc(db, "warehouses", idWarehouse), data);
};

export const deleteWarehouse = async (idWarehouse: string) => {
  return await deleteDoc(doc(db, "warehouses", idWarehouse));
};

// ==================== POINTS DE VENTE (POINTSALE) ====================
const pointSaleRef = collection(db, "points_sale");

export const getPointSale = async (): Promise<PointSale[]> => {
  const snapshot = await getDocs(pointSaleRef);
  return snapshot.docs.map(
    (doc) => ({ idPointSale: doc.id, ...doc.data() }) as PointSale,
  );
};

export const addPointSale = async (
  pointSale: Omit<PointSale, "idPointSale">,
) => {
  return await addDoc(pointSaleRef, pointSale);
};

export const updatePointSale = async (
  idPointSale: string,
  data: Partial<PointSale>,
) => {
  return await updateDoc(doc(db, "points_sale", idPointSale), data);
};

export const deletePointSale = async (idPointSale: string) => {
  return await deleteDoc(doc(db, "points_sale", idPointSale));
};

// ==================== STOCKS (STOCK) ====================
const stocksRef = collection(db, "stocks");

export const getStock = async (): Promise<Stock[]> => {
  const snapshot = await getDocs(stocksRef);
  return snapshot.docs.map(
    (doc) => ({ idStock: doc.id, ...doc.data() }) as Stock,
  );
};

export const getStockByPointSale = async (
  idPointSale: string,
): Promise<Stock[]> => {
  const q = query(stocksRef, where("idPointSale", "==", idPointSale));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(
    (doc) => ({ idStock: doc.id, ...doc.data() }) as Stock,
  );
};

export const addStock = async (stock: Omit<Stock, "idStock">) => {
  return await addDoc(stocksRef, stock);
};

export const updateStock = async (idStock: string, data: Partial<Stock>) => {
  return await updateDoc(doc(db, "stocks", idStock), data);
};

export const deleteStock = async (idStock: string) => {
  return await deleteDoc(doc(db, "stocks", idStock));
};

// ==================== TRANSFERTS (DELIVERYTRANSFER) ====================
const transfersRef = collection(db, "delivery_transfers");

export const getTransfers = async (): Promise<DeliveryTransfer[]> => {
  const snapshot = await getDocs(transfersRef);
  return snapshot.docs.map(
    (doc) => ({ idTransfer: doc.id, ...doc.data() }) as DeliveryTransfer,
  );
};

export const addTransfer = async (
  transfer: Omit<DeliveryTransfer, "idTransfer">,
) => {
  return await addDoc(transfersRef, {
    ...transfer,
    shippingDate: serverTimestamp(),
  });
};

export const updateTransfer = async (
  idTransfer: string,
  data: Partial<DeliveryTransfer>,
) => {
  return await updateDoc(doc(db, "delivery_transfers", idTransfer), data);
};

export const deleteTransfer = async (idTransfer: string) => {
  return await deleteDoc(doc(db, "delivery_transfers", idTransfer));
};

// ==================== ARTICLES DE TRANSFERT (TRANSFERITEM) ====================
const transferItemsRef = collection(db, "transfer_items");

export const getTransferItems = async (
  idItem: string,
): Promise<TransferItem[]> => {
  const q = query(transferItemsRef, where("idTransfer", "==", idItem));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(
    (doc) => ({ idItem: doc.id, ...doc.data() }) as TransferItem,
  );
};

export const addTransferItem = async (item: Omit<TransferItem, "idItem">) => {
  return await addDoc(transferItemsRef, item);
};

export const updateTransferItem = async (
  idItem: string,
  data: Partial<TransferItem>,
) => {
  return await updateDoc(doc(db, "transfer_items", idItem), data);
};

export const deleteTransferItem = async (idItem: string) => {
  return await deleteDoc(doc(db, "transfer_items", idItem));
};

// ==================== VENTES & PANIER (SALE & CART) ====================
const saleRef = collection(db, "sales");

export const getSales = async (): Promise<Sale[]> => {
  const snapshot = await getDocs(saleRef);
  return snapshot.docs.map(
    (doc) => ({ idSale: doc.id, ...doc.data() }) as Sale,
  );
};

export const addSale = async (sale: Omit<Sale, "idSale">) => {
  return await addDoc(saleRef, { ...sale, datetimes: serverTimestamp() });
};

export const updateSale = async (idSale: string, data: Partial<Sale>) => {
  return await updateDoc(doc(db, "sales", idSale), data);
};

export const deleteSale = async (idSale: string) => {
  return await deleteDoc(doc(db, "sales", idSale));
};

// ==================== FACTURES (INVOICE) ====================
const invoiceRef = collection(db, "invoices");

export const getInvoices = async (): Promise<Invoice[]> => {
  const snapshot = await getDocs(invoiceRef);
  return snapshot.docs.map(
    (doc) => ({ idInvoice: doc.id, ...doc.data() }) as Invoice,
  );
};

export const addInvoice = async (invoice: Omit<Invoice, "idInvoice">) => {
  return await addDoc(invoiceRef, { ...invoice, datetime: serverTimestamp() });
};

export const deleteInvoice = async (idInvoice: string) => {
  return await deleteDoc(doc(db, "invoices", idInvoice));
};
