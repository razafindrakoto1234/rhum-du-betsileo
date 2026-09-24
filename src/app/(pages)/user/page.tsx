"use client";

import {
  AlertTriangle,
  Ban,
  ChevronLeft,
  ChevronRight,
  Edit,
  Loader2,
  Mail,
  Phone,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  Users,
  UserX,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { UserData } from "@/types/user";
import { searchUsers } from "@/lib/service/user/search-user-service";
import { getUsers } from "@/lib/service/user/get-users-service";
import UserModal from "./userModal";
import { deleteUser } from "@/lib/service/user/delete-user-service";

interface UsersStats {
  total: number;
  admins: number;
  simples: number;
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [stats, setStats] = useState<UsersStats>({
    total: 0,
    admins: 0,
    simples: 0,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // ETATS DE SUPPRESSION
  const [userToDelete, setUserToDelete] = useState<UserData | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // --- PAGINATION ---
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [lastId, setLastId] = useState<string | null>(null);
  const [pageCursors, setPageCursors] = useState<(string | null)[]>([null]);

  // Fonction centrale pour charger ou rechercher les utilisateurs
  const fetchOrSearchUsers = useCallback(
    async (term: string, page: number, cursor: string | null) => {
      setLoading(true);
      setError("");

      try {
        if (term.trim() !== "") {
          // Mode Recherche globale via la nouvelle route et le nouveau service
          const response = await searchUsers(term);
          if (response && response.data) {
            setUsers(response.data);
            setHasMore(false); // Pas de pagination standard pendant une recherche
          }
        } else {
          // Mode Liste paginée normale
          const response = await getUsers(undefined, cursor);
          if (response && response.data) {
            setUsers(response.data);
            setHasMore(response.pagination?.hasMore ?? false);
            setLastId(response.pagination?.lastId || null);

            if (response.stats) {
              setStats(response.stats);
            }
          }
        }
      } catch (err: any) {
        setError(
          err.message || "Erreur lors de la récupération des utilisateurs.",
        );
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // Effet avec Debounce lors des saisies dans la recherche
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
      setPageCursors([null]);
      fetchOrSearchUsers(searchTerm, 1, null);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, fetchOrSearchUsers]);

  // Navigation page suivante
  const handleNextPage = () => {
    if (!hasMore || !lastId || loading) return;

    const nextPage = currentPage + 1;
    setPageCursors((prev) => {
      const updated = [...prev];
      updated[currentPage] = lastId;
      return updated;
    });

    setCurrentPage(nextPage);
    fetchOrSearchUsers(searchTerm, nextPage, lastId);
  };

  // Navigation page précédente
  const handlePreviousPage = () => {
    if (currentPage <= 1 || loading) return;

    const prevPage = currentPage - 1;
    const prevCursor = pageCursors[prevPage - 1] ?? null;

    setCurrentPage(prevPage);
    fetchOrSearchUsers(searchTerm, prevPage, prevCursor);
  };

  // Rechargement après création
  const handleSuccessCreate = () => {
    setSearchTerm("");
    setCurrentPage(1);
    setPageCursors([null]);
    fetchOrSearchUsers("", 1, null);
  };

  const isNextDisabled = !hasMore || !lastId || loading;

  // Déclarer l'état pour l'utilisateur sélectionné
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);

  // Fonction pour ouvrir en mode création
  const handleOpenCreateModal = () => {
    setSelectedUser(null);
    setIsModalOpen(true);
  };

  // Fonction pour ouvrir en mode modification
  const handleEditModal = (user: UserData) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;

    setIsDeleting(true);
    try {
      // Pass l'objet de type DeleteUserData { userId: string }
      await deleteUser({ userId: userToDelete.idUser });

      setUserToDelete(null);
      handleSuccessCreate();
    } catch (err: any) {
      setError(err.message || "Erreur lors de la suppression.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Gestion des Utilisateurs
          </h1>
          <p className="text-sm text-slate-500">
            Gérer les accès et les rôles du personnel Natur'eau
          </p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-4 py-2.5 rounded-xl shadow-md shadow-blue-500/20 transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Nouvel agent</span>
        </button>
      </div>

      {/* Cartes de statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Users className="w-6 h-6 text-slate-500" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">
              Total Utilisateurs
            </p>
            <p className="text-2xl font-extrabold text-slate-900">
              {loading ? "..." : stats.total}
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <ShieldCheck className="w-6 h-6 text-slate-500" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">
              Administrateurs
            </p>
            <p className="text-2xl font-extrabold text-slate-900">
              {loading ? "..." : stats.admins}
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <ShieldCheck className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">
              Agents Simple
            </p>
            <p className="text-2xl font-extrabold text-slate-900">
              {loading ? "..." : stats.simples}
            </p>
          </div>
        </div>
      </div>

      {/* Recherche */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Recherche par nom..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600 transition"
          />
        </div>
      </div>

      {/* Message d'erreur */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-600 text-sm rounded-xl">
          {error}
        </div>
      )}

      {/* Liste des utilisateurs */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-16 text-slate-400 space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-sm font-medium">Chargement des profils...</p>
        </div>
      ) : users.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center text-slate-500 space-y-2 border border-slate-100 shadow-sm">
          <UserX className="w-10 h-10 mx-auto text-slate-300" />
          <p className="font-medium">Aucun utilisateur trouvé.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {users.map((user) => {
            const roleLower = user.responsability?.toLowerCase() || "";
            const isAdmin =
              roleLower === "administrateur" || roleLower === "admin";

            return (
              <div
                key={user.idUser}
                className="bg-white border border-slate-100 rounded-2xl p-6 shadow-md transition-all duration-200 flex flex-col justify-between"
              >
                <div className="flex items-start gap-5">
                  <div className="relative shrink-0">
                    {user.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt={user.name}
                        className="w-20 h-20 sm:h-24 rounded-full object-cover border-2 border-slate-100 shadow-inner"
                      />
                    ) : (
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-slate-100 text-slate-600 font-bold text-2xl flex items-center justify-center border-2 border-slate-200">
                        {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                      </div>
                    )}
                    <span
                      className={`absolute -bottom-1 -right-1 p-1.5 rounded-full border-2 border-white text-white ${
                        isAdmin ? "bg-amber-600" : "bg-blue-600"
                      }`}
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                    </span>
                  </div>

                  <div className="flex-1 min-w-0 space-y-2">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 truncate">
                        {user.name}
                      </h3>
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-md text-xs font-semibold mt-1 ${
                          isAdmin
                            ? "bg-amber-50 text-amber-700 border border-amber-700"
                            : "bg-blue-50 text-blue-700 border border-blue-100"
                        }`}
                      >
                        {user.responsability}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-500 pt-1">
                      <div className="flex items-center gap-2 truncate">
                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{user.mail}</span>
                      </div>

                      {user.smartphone && (
                        <div className="flex items-center gap-2 font-mono">
                          <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{user.smartphone}</span>
                        </div>
                      )}
                    </div>

                    {user.createdAt && (
                      <p className="text-[11px] text-slate-400 pt-2 border-t border-slate-50">
                        Ajouté le{" "}
                        {new Date(user.createdAt).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    onClick={() => handleEditModal(user)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-blue-600 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 rounded-lg transition"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Modifier</span>
                  </button>

                  {!isAdmin && (
                    <button
                      onClick={() => setUserToDelete(user)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50/50 hover:bg-rose-50 border border-rose-100 hover:border-rose-200 rounded-lg transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Supprimer</span>
                    </button>
                  )}

                  <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 border border-slate-200 rounded-lg transition">
                    <Ban className="w-3.5 h-3.5" />
                    <span>Bloquer</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Barre de Pagination */}
      {!loading && users.length > 0 && searchTerm.trim() === "" && (
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

      {/* Modal Création / Modification */}
      <UserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleSuccessCreate}
        userToEdit={selectedUser}
      />

      {/* Modal Confirmation de Suppression */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl space-y-4 border border-slate-100">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-3 bg-rose-50 rounded-xl">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Confirmer la suppression
              </h3>
            </div>

            <p className="text-sm text-slate-600">
              Êtes-vous sûr de vouloir supprimer l'utilisateur{" "}
              <strong className="text-slate-900">{userToDelete.name}</strong> ?
              Cette action est irréversible.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                Annuler
              </button>

              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-md shadow-rose-500/20 transition disabled:opacity-50"
              >
                {isDeleting && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>Supprimer</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
