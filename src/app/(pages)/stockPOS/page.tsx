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
  Store,
  Box,
  Wine,
  Edit3,
  Plus,
} from "lucide-react";
import Link from "next/link";
import { ProductData } from "@/types/product";
import { getProducts } from "@/lib/service/product/get-products-service";
import { searchProduct } from "@/lib/service/product/search-product-service";
import POSStockModal from "./stockPOSModal";
import { getPosStocks } from "@/lib/service/stockPOS/get-posstock-service";

export default function StockPOSPage() {
  const searchParams = useSearchParams();

  // Récupération robuste de l'ID du POS depuis l'URL
  const posId =
    searchParams.get("POSId") ||
    searchParams.get("idPOS") ||
    searchParams.get("posId");
  const posName =
    searchParams.get("POSName") || searchParams.get("posName") || "";

  const [isPOSStockModalOpen, setIsPOSStockModalOpen] =
    useState<boolean>(false);
  const [selectedProductForPOSStock, setSelectedProductForPOSStock] =
    useState<ProductData | null>(null);
  const [selectedCapacityIdForModal, setSelectedCapacityIdForModal] =
    useState<string>("");

  const [products, setProducts] = useState<ProductData[]>([]);
  const [loadingProducts, setLoadingProducts] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const [POSStocks, setPOSStocks] = useState<Record<string, any>>({});

  // Pagination (6 par page)
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [lastId, setLastId] = useState<string | null>(null);
  const [pageCursors, setPageCursors] = useState<(string | null)[]>([null]);

  const PAGE_LIMIT = 6;

  const fetchPOSStock = useCallback(async () => {
    if (!posId) return;

    try {
      const response = await getPosStocks(posId);
      console.log("Données brutes reçues de l'API POSStocks :", response);

      if (response?.success && Array.isArray(response.POSStocks)) {
        const mapStock: Record<string, any> = {};

        response.POSStocks.forEach((item: any) => {
          const pId = item.idProduct || item.productId;
          const cId = item.idCapacity || item.capacityId;

          if (pId && cId) {
            const stockData = {
              idProduct: pId,
              idCapacity: cId,
              carton: Number(item.cartonQuantity ?? item.carton ?? 0),
              bottle: Number(item.bottleQuantity ?? item.bottle ?? 0),
              total: Number(item.totalBottles ?? item.total ?? 0),
            };

            // Stockage par clé composée et sauvegarde de l'objet complet
            mapStock[`${pId}_${cId}`] = stockData;
          }
        });

        console.log("MapStock final généré :", mapStock);
        setPOSStocks(mapStock);
      }
    } catch (err) {
      console.error("Erreur récupération stocks :", err);
    }
  }, [posId]);

  useEffect(() => {
    if (posId) {
      fetchPOSStock();
    }
  }, [posId, fetchPOSStock]);

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
        console.error("Erreur lors du chargement des produits :", err);
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

  const handleOpenPOSStockModal = (
    product: ProductData,
    capacityId?: string,
  ) => {
    setSelectedProductForPOSStock(product);
    setSelectedCapacityIdForModal(capacityId || "");
    setIsPOSStockModalOpen(true);
  };

  const handlePOSStockSuccess = () => {
    setIsPOSStockModalOpen(false);
    setSelectedProductForPOSStock(null);
    setSelectedCapacityIdForModal("");
    fetchPOSStock();
  };

  const isNextDisabled = !hasMore || !lastId || loadingProducts;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 p-6">
      <Link
        href="/pointSale"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Retour aux points de vente</span>
      </Link>

      {/* En-tête de la page */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2 flex-wrap">
            <span>Stock Point de Vente</span>
            {posName && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-600 text-xs font-semibold rounded-full border border-blue-100">
                <Store className="w-3.5 h-3.5" />
                {posName}
              </span>
            )}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Consultez tous les produits et leurs disponibilités pour ce point
            d'encaissement
          </p>
        </div>

        {/* Barre de recherche */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher un produit..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600 transition"
          />
        </div>
      </div>

      {/* Liste des produits sous forme de grille de cartes */}
      {loadingProducts ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-xs font-medium">Chargement des produits...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="bg-slate-50/50 border border-dashed border-slate-200 rounded-3xl p-16 text-center text-slate-500 shadow-sm space-y-3">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto">
            <Package className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">
            Aucun produit trouvé
          </h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {products.map((product) => (
            <div
              key={product.idProduct}
              className="bg-white border border-slate-100 rounded-3xl p-5 shadow-xl shadow-slate-100 flex flex-col justify-between space-y-4 hover:border-slate-200 transition-all duration-200"
            >
              {/* Entête de la carte (Image + Nom) */}
              <div className="flex items-start gap-3.5">
                <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 shrink-0 flex items-center justify-center overflow-hidden shadow-inner">
                  {product.imageURL ? (
                    <img
                      src={product.imageURL}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <ImageIcon className="w-6 h-6 text-slate-300" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Réf : {product.idProduct.substring(0, 8)}...
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 truncate mt-0.5">
                    {product.name}
                  </h3>
                </div>
              </div>

              {/* Formats et Capacités */}
              <div className="pt-3 border-t border-slate-50 space-y-2.5">
                <span className="text-[11px] font-bold text-slate-700 uppercase">
                  Formats & Capacités
                </span>

                {product.capacities && product.capacities.length > 0 ? (
                  <div className="space-y-2">
                    {product.capacities.map((cap, cIdx) => {
                      const capacityId =
                        cap.idCapacity || (cap as any).id || `cap-${cIdx}`;
                      const stockKey = `${product.idProduct}_${capacityId}`;

                      // Recherche robuste du stock (par clé exacte ou par correspondance directe des IDs)
                      const currentPOSStock =
                        POSStocks[stockKey] ||
                        Object.values(POSStocks).find(
                          (s: any) =>
                            s.idProduct === product.idProduct &&
                            s.idCapacity === capacityId,
                        );

                      return (
                        <div
                          key={capacityId}
                          className="bg-slate-50 border border-slate-100 p-3 rounded-2xl flex items-center justify-between gap-2 text-xs"
                        >
                          <div className="space-y-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 truncate">
                                {cap.capacity}
                              </span>
                              <span className="text-[11px] font-semibold text-blue-600 shrink-0">
                                Ar {cap.price?.toLocaleString("fr-FR")}
                              </span>
                            </div>

                            {currentPOSStock ? (
                              <div className="space-y-0.5">
                                <div className="flex flex-wrap items-center gap-1">
                                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded text-[10px] font-bold border border-blue-100">
                                    <Box className="w-2.5 h-2.5 text-blue-600" />
                                    {currentPOSStock.carton} ctn
                                  </span>
                                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-amber-50 text-amber-700 rounded text-[10px] font-bold border border-amber-100">
                                    <Wine className="w-2.5 h-2.5 text-amber-600" />
                                    {currentPOSStock.bottle} btl
                                  </span>
                                </div>
                                <div className="text-[10px] font-medium text-slate-500">
                                  Total :{" "}
                                  <span className="font-bold text-slate-900">
                                    {currentPOSStock.total} btl
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <span className="text-[10px] text-slate-400 italic">
                                Stock non renseigné
                              </span>
                            )}
                          </div>

                          <div className="shrink-0">
                            <button
                              type="button"
                              onClick={() =>
                                handleOpenPOSStockModal(product, capacityId)
                              }
                              className={`p-2 rounded-xl text-white transition shadow-sm ${
                                currentPOSStock
                                  ? "bg-amber-500 hover:bg-amber-600"
                                  : "bg-blue-600 hover:bg-blue-700"
                              }`}
                              title={
                                currentPOSStock
                                  ? "Modifier le stock"
                                  : "Initialiser le stock"
                              }
                            >
                              {currentPOSStock ? (
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
                  <p className="text-[11px] text-slate-400 italic">
                    Aucune capacité disponible.
                  </p>
                )}
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

      <POSStockModal
        isOpen={isPOSStockModalOpen}
        onClose={() => setIsPOSStockModalOpen(false)}
        idPOS={posId || ""}
        name={posName}
        product={selectedProductForPOSStock}
        initialCapacityId={selectedCapacityIdForModal}
        currentStockMap={POSStocks}
        onSuccess={handlePOSStockSuccess}
      />
    </div>
  );
}
