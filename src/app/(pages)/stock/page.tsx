"use client";

import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  Loader2,
  Package,
  Search,
  Warehouse,
  Plus,
  Box,
  Wine,
  Edit3,
} from "lucide-react";
import Link from "next/link";
import { ProductData } from "@/types/product";
import { getProducts } from "@/lib/service/product/get-products-service";
import { searchProduct } from "@/lib/service/product/search-product-service";
import { getStock } from "@/lib/service/stock/get-stock-service";
import StockModal from "./stockModal";

export default function StockPage() {
  const searchParams = useSearchParams();
  const warehouseId = searchParams.get("warehouseId");
  const warehouseName = searchParams.get("warehouseName") || "";

  const [isStockModalOpen, setIsStockModalOpen] = useState<boolean>(false);
  const [selectedProductForStock, setSelectedProductForStock] =
    useState<ProductData | null>(null);
  const [selectedCapacityIdForModal, setSelectedCapacityIdForModal] =
    useState<string>("");

  const [products, setProducts] = useState<ProductData[]>([]);
  const [loadingProducts, setLoadingProducts] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const [stocks, setStocks] = useState<
    Record<string, { carton: number; bottle: number; total: number }>
  >({});

  // États pour la pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [lastId, setLastId] = useState<string | null>(null);
  const [pageCursors, setPageCursors] = useState<(string | null)[]>([null]);

  const PAGE_LIMIT = 2;

  const fetchWarehouseStock = useCallback(async () => {
    if (!warehouseId) return;

    try {
      const response = await getStock(warehouseId);

      if (response?.success && Array.isArray(response.stocks)) {
        const mapStock: Record<
          string,
          { carton: number; bottle: number; total: number }
        > = {};

        response.stocks.forEach((item) => {
          mapStock[`${item.idProduct}_${item.idCapacity}`] = {
            carton: item.cartonQuantity || 0,
            bottle: item.bottleQuantity || 0,
            total: item.totalBottles || 0,
          };
        });

        setStocks(mapStock);
      }
    } catch (err) {
      console.error("Erreur récupération stocks :", err);
    }
  }, [warehouseId]);

  useEffect(() => {
    fetchWarehouseStock();
  }, [fetchWarehouseStock]);

  const handleOpenStockModal = (product: ProductData, capacityId?: string) => {
    setSelectedProductForStock(product);
    setSelectedCapacityIdForModal(capacityId || "");
    setIsStockModalOpen(true);
  };

  const handleStockSuccess = () => {
    setIsStockModalOpen(false);
    setSelectedProductForStock(null);
    setSelectedCapacityIdForModal("");
    fetchWarehouseStock();
  };

  const fetchOrSearchProducts = useCallback(
    async (term: string, page: number, cursor: string | null) => {
      setLoadingProducts(true);
      try {
        if (term.trim() !== "") {
          const response = await searchProduct(term);
          if (response?.data) {
            setProducts(response.data);
            setHasMore(false);
          }
        } else {
          const response = await getProducts(PAGE_LIMIT, cursor);
          if (response?.data) {
            setProducts(response.data);
            setHasMore(response.pagination?.hasMore ?? false);
            setLastId(response.pagination?.lastId || null);
          }
        }
      } catch (err) {
        console.error("Erreur chargement produits:", err);
      } finally {
        setLoadingProducts(false);
      }
    },
    [PAGE_LIMIT],
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
      setPageCursors([null]);
      fetchOrSearchProducts(searchTerm, 1, null);
    }, 600);
    return () => clearTimeout(timer);
  }, [searchTerm, fetchOrSearchProducts]);

  const handleNextPage = () => {
    if (!hasMore || !lastId || loadingProducts) return;
    const nextPage = currentPage + 1;
    setPageCursors((prev) => {
      const updated = [...prev];
      updated[currentPage] = lastId;
      return updated;
    });
    setCurrentPage(nextPage);
    fetchOrSearchProducts(searchTerm, nextPage, lastId);
  };

  const handlePreviousPage = () => {
    if (currentPage <= 1 || loadingProducts) return;
    const prevPage = currentPage - 1;
    const prevCursor = pageCursors[prevPage - 1] ?? null;
    setCurrentPage(prevPage);
    fetchOrSearchProducts(searchTerm, prevPage, prevCursor);
  };

  const isNextDisabled = !hasMore || !lastId || loadingProducts;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {warehouseId && (
        <Link
          href="/warehouse"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retour aux entrepôts</span>
        </Link>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2 flex-wrap">
            <span>Gestion du Stock</span>
            {warehouseId && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-600 text-xs font-semibold rounded-full border border-blue-100">
                <Warehouse className="w-3.5 h-3.5" />
                {warehouseName || `Dépôt #${warehouseId.substring(0, 8)}`}
              </span>
            )}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Suivi des cartons, bouteilles et conversion globale en stock
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher par nom de boisson..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600 transition"
          />
        </div>
      </div>

      {loadingProducts ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400 space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-sm font-medium">Chargement des produits...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center text-slate-500 shadow-sm">
          <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-800">
            Aucun produit trouvé
          </h3>
        </div>
      ) : (
        <div className="space-y-6">
          {products.map((product) => (
            <div
              key={product.idProduct}
              className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row gap-6 items-start"
            >
              <div className="w-full md:w-40 h-40 rounded-2xl bg-slate-50 border border-slate-100 shrink-0 flex items-center justify-center overflow-hidden">
                {product.imageURL ? (
                  <img
                    src={product.imageURL}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ImageIcon className="w-10 h-10 text-slate-300" />
                )}
              </div>

              <div className="flex-1 min-w-0 w-full space-y-4">
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400">
                    Réf : {product.idProduct}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 truncate">
                    {product.name}
                  </h3>
                </div>

                <div className="border-t border-slate-100 pt-3 space-y-3">
                  <h4 className="text-xs font-semibold text-slate-700 uppercase">
                    Formats & Quantités
                  </h4>

                  {product.capacities && product.capacities.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {product.capacities.map((cap, cIdx) => {
                        const capacityId = cap.idCapacity || `cap-${cIdx}`;
                        const stockKey = `${product.idProduct}_${capacityId}`;
                        const currentStock = stocks[stockKey];

                        return (
                          <div
                            key={capacityId}
                            className="bg-slate-50 border border-slate-100 p-3.5 rounded-2xl flex items-center justify-between gap-3"
                          >
                            <div className="space-y-1.5">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-slate-900">
                                  {cap.capacity}
                                </span>
                                <span className="text-[11px] font-semibold text-blue-600">
                                  Ar {cap.price?.toLocaleString("fr-FR")}
                                </span>
                              </div>

                              {currentStock ? (
                                <div className="space-y-1">
                                  <div className="flex flex-wrap items-center gap-1.5">
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md text-[11px] font-bold border border-blue-100">
                                      <Box className="w-3 h-3 text-blue-600" />
                                      {currentStock.carton} carton(s)
                                    </span>
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-700 rounded-md text-[11px] font-bold border border-amber-100">
                                      <Wine className="w-3 h-3 text-amber-600" />
                                      {currentStock.bottle} btl(s)
                                    </span>
                                  </div>
                                  <div className="text-[11px] font-semibold text-slate-500">
                                    Total :{" "}
                                    <span className="text-slate-900 font-bold">
                                      {currentStock.total} bouteilles
                                    </span>
                                  </div>
                                </div>
                              ) : (
                                <div className="text-[10px] font-medium text-slate-400 italic">
                                  Stock non initialisé
                                </div>
                              )}
                            </div>

                            <div className="shrink-0">
                              <button
                                type="button"
                                onClick={() =>
                                  handleOpenStockModal(product, capacityId)
                                }
                                className={`p-2 rounded-xl text-white transition shadow-sm ${
                                  currentStock
                                    ? "bg-amber-500 hover:bg-amber-600"
                                    : "bg-blue-600 hover:bg-blue-700"
                                }`}
                                title={
                                  currentStock
                                    ? "Modifier le stock"
                                    : "Initialiser le stock"
                                }
                              >
                                {currentStock ? (
                                  <Edit3 className="w-4 h-4" />
                                ) : (
                                  <Plus className="w-4 h-4" />
                                )}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">
                      Aucune capacité disponible.
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Barre de Pagination */}
      {!loadingProducts && products.length > 0 && searchTerm.trim() === "" && (
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center justify-between mt-6">
          <div className="text-sm font-medium text-slate-600">
            Page <span className="font-bold text-slate-900">{currentPage}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePreviousPage}
              disabled={currentPage === 1 || loadingProducts}
              className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Précédent</span>
            </button>

            <button
              onClick={handleNextPage}
              disabled={isNextDisabled}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition shadow-md shadow-blue-500/10"
            >
              <span>Suivant</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <StockModal
        isOpen={isStockModalOpen}
        onClose={() => setIsStockModalOpen(false)}
        warehouseId={warehouseId || ""}
        warehouseName={warehouseName}
        product={selectedProductForStock}
        initialCapacityId={selectedCapacityIdForModal}
        currentStockMap={stocks}
        onSuccess={handleStockSuccess}
      />
    </div>
  );
}
