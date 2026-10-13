"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Store,
  Plus,
  MapPin,
  CheckCircle2,
  XCircle,
  Loader2,
  RefreshCw,
  Search,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Package,
} from "lucide-react";
import { PointOfSaleData } from "@/types/pointOfSale";
import { UserData } from "@/types/user";
import { fetchPointsOfSale } from "@/lib/service/pointOfSale/fetch-pos-service";
import { searchPOS } from "@/lib/service/pointOfSale/search-pos-service";
import { fetchUsers } from "@/lib/service/user/fetch-user-service";
import PointSaleModal from "@/app/(pages)/pointSale/pointSaleModal";
import DeleteModalConfirmation from "@/components/confirmation/deleteModalConfirmation";
import { useRouter } from "next/navigation";

export default function PointSalePage() {
  const [pointsOfSale, setPointsOfSale] = useState<PointOfSaleData[]>([]);
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [totalCount, setTotalCount] = useState<number>(0);
  const [selectedPOSForEdit, setSelectedPOSForEdit] =
    useState<PointOfSaleData | null>(null);

  const router = useRouter();

  const handleViewPOSStock = (idPOS: string, name: string) => {
    // On passe id ET name dans l'URL
    router.push(`/stockPOS?POSId=${idPOS}&POSName=${encodeURIComponent(name)}`);
  };

  const [POSToDelete, setPOSToDelete] = useState<PointOfSaleData | null>(null);

  // --- PAGINATION PAR PAGE ---
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [lastId, setLastId] = useState<string | null>(null);
  const [pageCursors, setPageCursors] = useState<(string | null)[]>([null]);

  const PAGE_LIMIT = 6;

  const loadPOSData = useCallback(
    async (page: number, cursor: string | null) => {
      setLoading(true);
      setError("");

      try {
        const [posResponse, userData] = await Promise.all([
          fetchPointsOfSale(PAGE_LIMIT, cursor),
          fetchUsers(),
        ]);

        if (posResponse && posResponse.data) {
          setPointsOfSale(posResponse.data);
          setHasMore(posResponse.pagination?.hasMore ?? false);
          setLastId(posResponse.pagination?.lastId || null);
          if (posResponse.stats) setTotalCount(posResponse.stats.total);
        }
        setUsers(userData);
      } catch (err: any) {
        console.error("Erreur lors de la récupération des données:", err);
        setError(
          err.message || "Erreur lors de la récupération des points de vente.",
        );
      } finally {
        setLoading(false);
      }
    },
    [PAGE_LIMIT],
  );

  // Gestion de la recherche avec l'API dédiée et debounce
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.trim() !== "") {
        setLoading(true);
        setError("");
        try {
          const response = await searchPOS(searchQuery);
          if (response && response.data) {
            setPointsOfSale(response.data);
            setHasMore(false);
          }
        } catch (err: any) {
          console.error("Erreur lors de la recherche:", err);
          setError(err.message || "Erreur lors de la recherche.");
        } finally {
          setLoading(false);
        }
      } else {
        setCurrentPage(1);
        setPageCursors([null]);
        loadPOSData(1, null);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, loadPOSData]);

  const handleNextPage = () => {
    if (!hasMore || !lastId || loading) return;

    const nextPage = currentPage + 1;
    setPageCursors((prev) => {
      const updated = [...prev];
      updated[currentPage] = lastId;
      return updated;
    });

    setCurrentPage(nextPage);
    loadPOSData(nextPage, lastId);
  };

  const handlePreviousPage = () => {
    if (currentPage <= 1 || loading) return;

    const prevPage = currentPage - 1;
    const prevCursor = pageCursors[prevPage - 1] ?? null;

    setCurrentPage(prevPage);
    loadPOSData(prevPage, prevCursor);
  };

  const handleOpenCreateModal = () => {
    setSelectedPOSForEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenUpdateModal = (pos: PointOfSaleData) => {
    setSelectedPOSForEdit(pos);
    setIsModalOpen(true); // <-- C'est cette ligne qui manquait pour ouvrir le modal !
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPOSForEdit(null);
  };

  const handleDeleteSuccess = () => {
    setPOSToDelete(null);
    setSearchQuery("");
    loadPOSData(1, null); // <-- Recharge les données de la page 1
  };

  const isNextDisabled = !hasMore || !lastId || loading;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl shadow-sm">
            <Store className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Points de Vente{" "}
              <span className="text-xs text-slate-400 font-normal">
                ({totalCount})
              </span>
            </h1>
            <p className="text-xs text-slate-500">
              Gérez vos points d'encaissement et leurs responsables
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher par nom, lieu..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600 transition"
            />
          </div>

          <button
            onClick={() => {
              setSearchQuery("");
              loadPOSData(1, null);
            }}
            className="p-2.5 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-2xl transition shadow-sm flex items-center justify-center shrink-0"
            title="Rafraîchir"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>

          <button
            onClick={handleOpenCreateModal}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-blue-500/20 active:scale-[0.98] shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Nouveau Point de Vente</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-100 text-rose-700 rounded-2xl text-xs font-medium flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={() => loadPOSData(1, null)}
            className="underline font-bold"
          >
            Réessayer
          </button>
        </div>
      )}

      {loading && pointsOfSale.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-xs text-slate-400 font-medium">
            Chargement des points de vente...
          </p>
        </div>
      ) : pointsOfSale.length === 0 ? (
        <div className="text-center py-20 bg-slate-50/50 border border-dashed border-slate-200 rounded-3xl space-y-3">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto">
            <Store className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-800">
              Aucun point de vente
            </h3>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              {searchQuery
                ? "Aucun résultat ne correspond à votre recherche."
                : "Commencez par enregistrer votre premier point d'encaissement."}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {pointsOfSale.map((pos) => {
              const isActive = pos.status === "ACTIVE";
              const assignedUser = users.find((u) => u.idUser === pos.idUser);

              return (
                <div
                  key={pos.idPOS}
                  className="bg-white border border-slate-100 rounded-3xl p-5 shadow-xl shadow-slate-100 flex flex-col justify-between space-y-4 hover:border-slate-200 transition-all duration-200"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold shrink-0 shadow-inner">
                        <Store className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-bold text-slate-900 truncate">
                          {pos.name}
                        </h3>
                        <div className="flex items-center gap-1 text-slate-400 text-[11px] mt-0.5">
                          <MapPin className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">
                            {pos.location || "Aucune localisation"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold shrink-0 ${
                        isActive
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                          : "bg-slate-100 text-slate-600 border border-slate-200"
                      }`}
                    >
                      {isActive ? (
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <XCircle className="w-3 h-3 text-slate-400" />
                      )}
                      {isActive ? "Actif" : "Inactif"}
                    </span>
                  </div>

                  <div className="pt-3 border-t border-slate-50 flex items-center justify-between text-xs">
                    {assignedUser ? (
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="relative w-7 h-7 rounded-full overflow-hidden bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 font-bold text-[10px] shrink-0">
                          {assignedUser.photoURL ? (
                            <img
                              src={assignedUser.photoURL}
                              alt={assignedUser.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span>
                              {(assignedUser.name || "U")
                                .substring(0, 2)
                                .toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[11px] font-bold text-slate-800 truncate">
                            {assignedUser.name}
                          </p>
                          <p className="text-[9px] text-slate-400 truncate">
                            Responsable
                          </p>
                        </div>
                      </div>
                    ) : (
                      <span className="text-[11px] font-medium text-slate-400 italic">
                        Aucun responsable assigné
                      </span>
                    )}

                    <button
                      onClick={() => handleViewPOSStock(pos.idPOS, pos.name)}
                      type="button"
                      className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-[11px] font-bold transition flex items-center gap-1.5 shrink-0"
                      title="Voir le stock de ce point de vente"
                    >
                      <Package className="w-3.5 h-3.5" />
                      <span>Stock</span>
                    </button>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleOpenUpdateModal(pos)}
                        type="button"
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition"
                        title="Modifier"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setPOSToDelete(pos)}
                        type="button"
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Barre de Pagination par Page */}
          {searchQuery.trim() === "" && (
            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center justify-between mt-6">
              <div className="text-sm font-medium text-slate-600">
                Page{" "}
                <span className="font-bold text-slate-900">{currentPage}</span>
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
        </div>
      )}

      <PointSaleModal
        isOpen={isModalOpen}
        posToEdit={selectedPOSForEdit}
        onClose={handleCloseModal}
        onSuccess={() => {
          handleCloseModal();
          setSearchQuery("");
          loadPOSData(1, null);
        }}
      />

      <DeleteModalConfirmation
        isOpen={Boolean(POSToDelete)}
        onClose={() => setPOSToDelete(null)}
        deleteUrl="/api/point-of-sale/delete-pos"
        payload={{ idPOS: POSToDelete?.idPOS }}
        title="Supprimer le point de vente ?"
        message={`Êtes-vous sûr de vouloir supprimer "${POSToDelete?.name}" ? Cette action est irréversible.`}
        confirmButtonText="Supprimer"
        onSuccess={handleDeleteSuccess}
      />
    </div>
  );
}
