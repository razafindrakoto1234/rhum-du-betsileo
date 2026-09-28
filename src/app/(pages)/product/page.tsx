"use client";

import DeleteModalConfirmation from "@/components/confirmation/deleteModalConfirmation";
import { searchProduct } from "@/lib/service/product/search-product-service";
import { getProducts } from "@/lib/service/product/get-products-service";
import { ProductData } from "@/types/product";
import {
  ChevronLeft,
  ChevronRight,
  Edit,
  Image as ImageIcon,
  Loader2,
  Package,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import ProductModal from "./productModal";

export default function Product() {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedProductForEdit, setSelectedProductForEdit] =
    useState<ProductData | null>(null);

  const [productToDelete, setProductToDelete] = useState<ProductData | null>(
    null,
  );

  // États des données
  const [products, setProducts] = useState<ProductData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");

  // --- PAGINATION ---
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [lastId, setLastId] = useState<string | null>(null);
  const [pageCursors, setPageCursors] = useState<(string | null)[]>([null]);

  const PAGE_LIMIT = 6;

  const fetchOrSearchProducts = useCallback(
    async (term: string, page: number, cursor: string | null) => {
      setLoading(true);
      setError("");

      try {
        if (term.trim() !== "") {
          const response = await searchProduct(term);
          if (response && response.data) {
            setProducts(response.data);
            setHasMore(false);
          }
        } else {
          const response = await getProducts(PAGE_LIMIT, cursor);
          if (response && response.data) {
            setProducts(response.data);
            setHasMore(response.pagination?.hasMore ?? false);
            setLastId(response.pagination?.lastId || null);
          }
        }
      } catch (err: any) {
        console.error("Erreur lors de la récupération des produits:", err);
        setError(err.message || "Erreur lors de la récupération des produits.");
      } finally {
        setLoading(false);
      }
    },
    [PAGE_LIMIT],
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
      setPageCursors([null]);
      fetchOrSearchProducts(searchTerm, 1, null);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, fetchOrSearchProducts]);

  const handleNextPage = () => {
    if (!hasMore || !lastId || loading) return;

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
    if (currentPage <= 1 || loading) return;

    const prevPage = currentPage - 1;
    const prevCursor = pageCursors[prevPage - 1] ?? null;

    setCurrentPage(prevPage);
    fetchOrSearchProducts(searchTerm, prevPage, prevCursor);
  };

  // Ouverture en mode création
  const handleOpenCreateModal = () => {
    setSelectedProductForEdit(null);
    setIsModalOpen(true);
  };

  // Ouverture en mode modification
  const handleOpenEditModal = (product: ProductData) => {
    setSelectedProductForEdit(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProductForEdit(null);
  };

  // Rechargement après succès (création / modification)
  const handleSuccessModal = () => {
    handleCloseModal();
    setSearchTerm("");
    setCurrentPage(1);
    setPageCursors([null]);
    fetchOrSearchProducts("", 1, null);
  };

  // Callback après suppression réussie
  const handleDeleteSuccess = () => {
    setProductToDelete(null);
    fetchOrSearchProducts(
      searchTerm,
      currentPage,
      pageCursors[currentPage - 1] ?? null,
    );
  };

  const isNextDisabled = !hasMore || !lastId || loading;

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "AVAILABLE":
        return (
          <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs font-semibold shrink-0">
            In Stock
          </span>
        );
      case "OUT_OF_STOCK":
        return (
          <span className="px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-xs font-semibold shrink-0">
            Low Stock
          </span>
        );
      case "DISCONTINUED":
        return (
          <span className="px-3 py-1 bg-rose-50 text-rose-600 rounded-full text-xs font-semibold shrink-0">
            Obsolète
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Gestion des Produits
          </h1>
          <p className="text-sm text-slate-500">
            Catalogue général des boissons et articles
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-4 py-2.5 rounded-xl shadow-md shadow-blue-500/20 transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Nouveau produit</span>
        </button>
      </div>

      {/* Barre de recherche */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Recherche produit..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600 transition"
          />
        </div>
      </div>

      {/* Chargement */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400 space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-sm font-medium">Chargement des produits...</p>
        </div>
      ) : error ? (
        <div className="bg-rose-50 border border-rose-100 text-rose-700 p-4 rounded-2xl text-center text-sm">
          {error}
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-2xl p-12 text-center text-slate-500 space-y-2 shadow-sm">
          <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-800">
            Aucun produit trouvé
          </h3>
          <p className="text-xs text-slate-400">
            {searchTerm
              ? "Aucun résultat ne correspond à votre recherche."
              : "Commencez par ajouter un premier produit au catalogue."}
          </p>
        </div>
      ) : (
        /* Cartes Produits : Affichage 2 par 2 */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {products.map((product, index) => {
            const firstCap = product.capacities?.[0];
            const capacitiesList = product.capacities || [];
            const primaryStatus = firstCap?.status || "AVAILABLE";

            return (
              <div
                key={product.idProduct || `product-${index}`}
                className="bg-white border border-slate-100 rounded-3xl p-7 shadow-md hover:shadow-lg transition flex items-start gap-6"
              >
                {/* Image */}
                <div className="w-40 h-40 rounded-2xl bg-slate-50 border border-slate-100 overflow-hidden shrink-0 flex items-center justify-center">
                  {product.imageURL ? (
                    <img
                      src={product.imageURL}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <ImageIcon className="w-12 h-12 text-slate-300" />
                  )}
                </div>

                <div className="flex-1 min-w-0 flex flex-col justify-between min-h-[160px]">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-base font-bold text-slate-900 truncate">
                        {product.name}
                      </h3>
                      {getStatusBadge(primaryStatus)}
                    </div>

                    <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                      {product.description || "Aucune description fournie."}
                    </p>

                    {/* Liste des Capacités avec leurs Prix respectifs */}
                    {capacitiesList.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5 max-h-20 overflow-y-auto pr-1">
                        {capacitiesList.map((cap, cIdx) => (
                          <div
                            key={cap.idCapacity || `cap-${cIdx}`}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 border border-slate-100 rounded-lg text-xs"
                          >
                            <span className="font-medium text-slate-700">
                              {cap.capacity} :
                            </span>
                            <span className="font-bold text-blue-600">
                              Ar {cap.price.toLocaleString("fr-FR")}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions (Modifier / Supprimer) */}
                  {/* Actions (Modifier / Supprimer) */}
                  <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(product)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-blue-600 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 rounded-xl transition-all active:scale-95"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Modifier</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setProductToDelete(product)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50/60 hover:bg-rose-100/80 border border-rose-100 hover:border-rose-200 rounded-xl transition-all active:scale-95"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Supprimer</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {!loading && products.length > 0 && searchTerm.trim() === "" && (
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center justify-between mt-6">
          <div className="text-sm font-medium text-slate-600">
            Page <span className="font-bold text-slate-900">{currentPage}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePreviousPage}
              disabled={currentPage === 1 || loading}
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

      {/* Modal Produit (Création & Modification) */}
      <ProductModal
        isOpen={isModalOpen}
        productToEdit={selectedProductForEdit}
        onClose={handleCloseModal}
        onSuccess={handleSuccessModal}
      />

      {/* Modal de Confirmation de Suppression */}
      <DeleteModalConfirmation
        isOpen={Boolean(productToDelete)}
        onClose={() => setProductToDelete(null)}
        deleteUrl="/api/product/delete-product"
        payload={{ productId: productToDelete?.idProduct }}
        title="Supprimer le produit ?"
        message={`Êtes-vous sûr de vouloir supprimer "${productToDelete?.name}" ? Cette action est irréversible.`}
        confirmButtonText="Supprimer"
        onSuccess={handleDeleteSuccess}
      />
    </div>
  );
}
