"use client";

import { useState, useEffect, useRef } from "react";
import { X, Loader2, Store, ChevronDown } from "lucide-react";
import { UserData } from "@/types/user";
import { fetchUsers } from "@/lib/service/user/fetch-user-service";
import AddModalConfirmation from "@/components/confirmation/addModalConfirmation";
import UpdateModalConfirmation from "@/components/confirmation/updateModalConfirmation";
import { createPointOfSale } from "@/lib/service/pointOfSale/create-pos-service";
import { updatePointOfSale } from "@/lib/service/pointOfSale/update-pos-service";
import { PointOfSaleData } from "@/types/pointOfSale";

interface PointSaleModalProps {
  isOpen: boolean;
  posToEdit?: PointOfSaleData | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function PointSaleModal({
  isOpen,
  posToEdit = null,
  onClose,
  onSuccess,
}: PointSaleModalProps) {
  const isEditing = Boolean(posToEdit);

  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [idUser, setIdUser] = useState("");
  const [status, setStatus] = useState<"ACTIVE" | "INACTIVE">("ACTIVE");

  const [users, setUsers] = useState<UserData[]>([]);
  const [loadingUsers, setLoadingUsers] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  // État pour contrôler l'affichage du modal de confirmation de succès
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);

  // État pour le custom dropdown des utilisateurs
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Charger la liste des utilisateurs et remplir le formulaire si posToEdit existe
  useEffect(() => {
    if (isOpen) {
      setError("");
      setIsDropdownOpen(false);
      setShowSuccessModal(false);

      if (posToEdit) {
        setName(posToEdit.name || "");
        setLocation(posToEdit.location || "");
        setIdUser(posToEdit.idUser || "");
        setStatus(posToEdit.status === "ACTIVE" ? "ACTIVE" : "INACTIVE");
      } else {
        setName("");
        setLocation("");
        setIdUser("");
        setStatus("ACTIVE");
      }

      const loadUsers = async () => {
        setLoadingUsers(true);
        try {
          const userList = await fetchUsers();
          setUsers(userList);

          // Uniquement en mode création, si aucun utilisateur n'est défini, on prend le premier par défaut
          if (!posToEdit && userList.length > 0 && !idUser) {
            setIdUser(userList[0].idUser);
          }
        } catch (err) {
          console.error("Erreur chargement utilisateurs :", err);
          setError("Impossible de charger la liste des utilisateurs.");
        } finally {
          setLoadingUsers(false);
        }
      };

      loadUsers();
    }
  }, [isOpen, posToEdit]);

  // Fermer le dropdown en cliquant à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!isOpen) return null;

  const selectedUser = users.find((u) => u.idUser === idUser);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Le nom du point de vente est obligatoire.");
      return;
    }

    try {
      setLoading(true);

      if (isEditing && posToEdit?.idPOS) {
        // Mode Modification
        await updatePointOfSale(posToEdit.idPOS, {
          name: name.trim(),
          location: location.trim(),
          idUser: idUser ? idUser : undefined,
          status,
        });
      } else {
        // Mode Création
        await createPointOfSale({
          name: name.trim(),
          location: location.trim(),
          idUser: idUser ? idUser : undefined,
          status,
        });
      }

      setShowSuccessModal(true);
    } catch (err: any) {
      setError(err.message || "Erreur lors de l'enregistrement.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmSuccess = () => {
    setShowSuccessModal(false);
    onSuccess();
    onClose();
  };

  return (
    <>
      {/* Modal principal de formulaire */}
      <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in zoom-in-95">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                <Store className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  {isEditing
                    ? "Modifier le Point de Vente"
                    : "Nouveau Point de Vente"}
                </h2>
                <p className="text-xs text-slate-500">
                  {isEditing
                    ? "Mettre à jour les informations du point de vente"
                    : "Enregistrer un nouveau point d'encaissement"}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-100 text-rose-700 rounded-xl text-xs font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Nom du Point de Vente *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ex: Boutique Ambalavao Centre"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Localisation (Optionnel)
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="ex: Rue Principale, Ambalavao"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600 transition"
              />
            </div>

            {/* Sélection de l'utilisateur avec Custom Dropdown */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Responsable / Utilisateur (Optionnel)
              </label>
              {loadingUsers ? (
                <div className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-400 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                  <span>Chargement des utilisateurs...</span>
                </div>
              ) : (
                <div className="relative" ref={dropdownRef}>
                  <button
                    type="button"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-3.5 py-2.5 flex items-center justify-between hover:bg-slate-50 transition focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600"
                  >
                    {selectedUser ? (
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative w-8 h-8 rounded-full overflow-hidden bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 font-bold text-xs shrink-0">
                          {selectedUser.photoURL ? (
                            <img
                              src={selectedUser.photoURL}
                              alt={selectedUser.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span>
                              {(selectedUser.name || "U")
                                .substring(0, 2)
                                .toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div className="text-left min-w-0">
                          <p className="text-xs font-bold text-slate-900 truncate">
                            {selectedUser.name}
                          </p>
                          <p className="text-[10px] text-slate-400 truncate">
                            {selectedUser.mail}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">
                        Sélectionner un utilisateur
                      </span>
                    )}
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ml-2 ${
                        isDropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {isDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-xl py-2 z-50 max-h-48 overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
                      {users.map((user) => (
                        <button
                          key={user.idUser}
                          type="button"
                          onClick={() => {
                            setIdUser(user.idUser);
                            setIsDropdownOpen(false);
                          }}
                          className={`w-full flex items-center gap-3 px-3.5 py-2 hover:bg-slate-50 transition text-left ${
                            user.idUser === idUser ? "bg-blue-50/50" : ""
                          }`}
                        >
                          <div className="relative w-8 h-8 rounded-full overflow-hidden bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 font-bold text-xs shrink-0">
                            {user.photoURL ? (
                              <img
                                src={user.photoURL}
                                alt={user.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span>
                                {(user.name || "U")
                                  .substring(0, 2)
                                  .toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-900 truncate">
                              {user.name}
                            </p>
                            <p className="text-[10px] text-slate-400 truncate">
                              {user.mail}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Statut
              </label>
              <select
                value={status}
                onChange={(e) =>
                  setStatus(e.target.value as "ACTIVE" | "INACTIVE")
                }
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600 transition"
              >
                <option value="ACTIVE">Actif</option>
                <option value="INACTIVE">Inactif</option>
              </select>
            </div>

            <div className="flex items-center gap-3 pt-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Enregistrement...</span>
                  </>
                ) : (
                  <span>
                    {isEditing ? "Enregistrer" : "Créer le point de vente"}
                  </span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Conditionnel : Modal de confirmation selon le mode */}
      {isEditing ? (
        <UpdateModalConfirmation
          isOpen={showSuccessModal}
          onClose={handleConfirmSuccess}
          title="Point de vente modifié !"
          message="Les informations du point de vente ont été mises à jour avec succès."
          buttonText="Parfait"
        />
      ) : (
        <AddModalConfirmation
          isOpen={showSuccessModal}
          onClose={handleConfirmSuccess}
          title="Point de vente créé !"
          message="Le nouveau point de vente a été enregistré avec succès dans le système."
          buttonText="Parfait"
        />
      )}
    </>
  );
}
