"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Search,
  Warehouse,
  MapPin,
  Boxes,
  Check,
  Eye,
  Pencil,
  Trash2,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import WarehouseModal from "./warehouseModal";
import { WarehouseData } from "@/types/warehouse";
import { getWarehouses } from "@/lib/service/warehouse/get-warehouse-service";
import { searchWarehouse } from "@/lib/service/warehouse/search-warehouse-service";
import DeleteModalConfirmation from "@/components/confirmation/deleteModalConfirmation";
import { useRouter } from "next/navigation";

export default function WarehousesPage() {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedWarehouseForEdit, setSelectedWarehouseForEdit] =
    useState<WarehouseData | null>(null);

  const router = useRouter();

  const handleViewWarehouseStock = (idWarehouse: string, name: string) => {
    // On passe id ET name dans l'URL
    router.push(
      `/stock?warehouseId=${idWarehouse}&warehouseName=${encodeURIComponent(name)}`,
    );
  };

  const [warehouseToDelete, setWarehouseToDelete] =
    useState<WarehouseData | null>(null);

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [warehouses, setWarehouses] = useState<WarehouseData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  // --- PAGINATION ---
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [lastId, setLastId] = useState<string | null>(null);
  const [pageCursors, setPageCursors] = useState<(string | null)[]>([null]);

  const PAGE_LIMIT = 3;

  // Chargement / Récupération paginée des dépôts
  const fetchOrSearchWarehouses = useCallback(
    async (term: string, page: number, cursor: string | null) => {
      setLoading(true);
      setError("");

      try {
        if (term.trim() !== "") {
          const response = await searchWarehouse(term);
          if (response && response.data) {
            setWarehouses(response.data);
            setHasMore(false);
          }
        } else {
          const response = await getWarehouses(PAGE_LIMIT, cursor);
          if (response && response.data) {
            setWarehouses(response.data);
            setHasMore(response.pagination?.hasMore ?? false);
            setLastId(response.pagination?.lastId || null);
          }
        }
      } catch (err: any) {
        console.error("Erreur lors de la récupération des Entrepôts : ", err);
        setError(
          err.message || "Erreur lors de la récupération des Entrepôts.",
        );
      } finally {
        setLoading(false);
      }
    },
    [PAGE_LIMIT],
  );

  // Déclencheur sur recherche / changement de terme avec debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
      setPageCursors([null]);
      fetchOrSearchWarehouses(searchTerm, 1, null);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, fetchOrSearchWarehouses]);

  // Actions de Pagination
  const handleNextPage = () => {
    if (!hasMore || !lastId || loading) return;

    const nextPage = currentPage + 1;
    setPageCursors((prev) => {
      const updated = [...prev];
      updated[currentPage] = lastId;
      return updated;
    });
    setCurrentPage(nextPage);
    fetchOrSearchWarehouses(searchTerm, nextPage, lastId);
  };

  const handlePreviousPage = () => {
    if (currentPage <= 1 || loading) return;

    const prevPage = currentPage - 1;
    const prevCursor = pageCursors[prevPage - 1] ?? null;

    setCurrentPage(prevPage);
    fetchOrSearchWarehouses(searchTerm, prevPage, prevCursor);
  };

  const handleOpenCreateModal = () => {
    setSelectedWarehouseForEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenUpdateModal = (warehouse: WarehouseData) => {
    setSelectedWarehouseForEdit(warehouse);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedWarehouseForEdit(null);
  };

  const handleSuccessCreate = () => {
    setSearchTerm("");
    setCurrentPage(1);
    setPageCursors([null]);
    fetchOrSearchWarehouses("", 1, null);
    setIsModalOpen(false);
  };

  const handleDeleteSuccess = () => {
    setWarehouseToDelete(null);
    fetchOrSearchWarehouses(
      searchTerm,
      currentPage,
      pageCursors[currentPage - 1] ?? null,
    );
  };

  const isNextDisabled = !hasMore || !lastId || loading;

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Gestion des Entrepôts
          </h1>
          <p className="text-sm text-slate-500">
            Création et suivi des zones de stockage pour le Rhum du Betsileo
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-4 py-2.5 rounded-xl shadow-md shadow-blue-500/20 transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Nouvel Entrepôt</span>
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
            placeholder="Rechercher un dépôt..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600 transition"
          />
        </div>
      </div>

      {/* Affichage des Cartes */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-sm font-medium">Chargement des dépôts...</p>
        </div>
      ) : error ? (
        <div className="bg-rose-50 border border-rose-100 text-rose-700 p-4 rounded-2xl text-center text-sm">
          {error}
        </div>
      ) : warehouses.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm space-y-3">
          <Warehouse className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-semibold text-slate-700">
            Aucun dépôt trouvé
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {searchTerm
              ? "Aucun résultat ne correspond à votre recherche."
              : "Commencez par ajouter un nouvel entrepôt à votre système."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {warehouses.map((wh, index) => {
            const isActive = wh.status === "ACTIVE";

            return (
              <div
                key={wh.idWarehouse || `wh-${index}`}
                className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 relative"
              >
                {/* En-tête de la Carte */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-slate-50 text-slate-600 rounded-2xl border border-slate-100">
                      <Warehouse className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-base leading-snug">
                        {wh.name}
                      </h3>
                      {wh.location ? (
                        <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3.5 h-3.5" />
                          {wh.location}
                        </p>
                      ) : (
                        <p className="text-xs text-slate-300 italic mt-0.5">
                          Non localisé
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Statut ACTIF */}
                  {isActive && (
                    <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-md shadow-blue-500/30 flex-shrink-0">
                      <Check className="w-4 h-4 stroke-[2.5]" />
                    </div>
                  )}
                </div>

                {/* Détails / Capacité & Badges */}
                <div className="flex items-center gap-2 flex-wrap pt-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-full">
                    <Boxes className="w-3.5 h-3.5 text-slate-400" />
                    Capacité :{" "}
                    {wh.capacityMax ? wh.capacityMax.toLocaleString() : "N/A"}
                  </span>

                  <span
                    className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${
                      wh.status === "ACTIVE"
                        ? "bg-emerald-50 text-emerald-600"
                        : wh.status === "FULL"
                          ? "bg-amber-50 text-amber-600"
                          : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {wh.status === "ACTIVE"
                      ? "Actif"
                      : wh.status === "FULL"
                        ? "Saturé"
                        : "Inactif"}
                  </span>
                </div>

                {/* Pied de Carte : Boutons d'action à gauche, Voir plus à droite */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenUpdateModal(wh)}
                      type="button"
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setWarehouseToDelete(wh)}
                      type="button"
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    onClick={() =>
                      handleViewWarehouseStock(wh.idWarehouse, wh.name)
                    }
                    className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 transition py-1 px-3 rounded-lg hover:bg-blue-50"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Voir plus</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Bloc de Pagination */}
      {!loading && warehouses.length > 0 && searchTerm.trim() === "" && (
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

      {/* Modal de création */}
      <WarehouseModal
        isOpen={isModalOpen}
        WarehouseToEdit={selectedWarehouseForEdit}
        onClose={handleCloseModal}
        onSuccess={handleSuccessCreate}
      />

      <DeleteModalConfirmation
        isOpen={Boolean(warehouseToDelete)}
        onClose={() => setWarehouseToDelete(null)}
        deleteUrl="/api/warehouse/delete-warehouse"
        payload={{ idWarehouse: warehouseToDelete?.idWarehouse }}
        title="Supprimer l'entrepôt ?"
        message={`Êtes-vous sûr de vouloir supprimer "${warehouseToDelete?.name}" ? Cette action est irréversible.`}
        confirmButtonText="Supprimer"
        onSuccess={handleDeleteSuccess}
      />
    </div>
  );
}
