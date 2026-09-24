"use client";

import { AlertTriangle, Loader2, Trash2, X } from "lucide-react";
import { useState } from "react";

interface DeleteModalConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  /** L'endpoint API dynamique (ex: "/api/admin/delete-user") */
  deleteUrl: string;
  /** Le body JSON à envoyer dans la requête DELETE (ex: { userId: "123" }) */
  payload: Record<string, any>;
  /** Callback exécuté une fois la suppression réussie (ex: rafraîchir la table) */
  onSuccess?: () => void;
  title?: string;
  message?: string;
  confirmButtonText?: string;
}

export default function DeleteModalConfirmation({
  isOpen,
  onClose,
  deleteUrl,
  payload,
  onSuccess,
  title = "Confirmer la suppression",
  message = "Êtes-vous sûr de vouloir supprimer cet élément ? Cette action est irrreversible.",
  confirmButtonText = "Supprimer",
}: DeleteModalConfirmationProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDeleted, setIsDeleted] = useState(false);

  if (!isOpen) return null;

  // Réinitialiser les états lors de la fermeture
  const handleClose = () => {
    setError(null);
    setIsDeleted(false);
    setIsLoading(false);
    onClose();
  };

  const handleDelete = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(deleteUrl, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Une erreur est survenue lors de la suppression.",
        );
      }

      // Marquer comme supprimé pour afficher le feedback de succès
      setIsDeleted(true);

      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      setError(err.message || "Erreur serveur.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md transition-all duration-300 animate-in fade-in"
      onClick={handleClose}
    >
      <div
        className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 flex flex-col items-center text-center space-y-5 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition disabled:opacity-50"
          onClick={handleClose}
          disabled={isLoading}
          aria-label="Fermer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* --- ÉTAPE 1 : Confirmation avant suppression --- */}
        {!isDeleted ? (
          <>
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-tr from-rose-600 to-red-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-red-500/30 ring-8 ring-red-50">
                <Trash2 className="w-10 h-10 stroke-[2.25]" />
              </div>

              <span className="absolute -bottom-1 -right-1 bg-amber-500 text-white p-2 rounded-full border-2 border-white shadow-md">
                <AlertTriangle className="w-4 h-4 stroke-[2.5]" />
              </span>
            </div>

            <div className="space-y-2 pt-2">
              <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
                {title}
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed max-w-xs mx-auto">
                {message}
              </p>
            </div>

            {/* Message d'erreur s'il y en a une */}
            {error && (
              <div className="w-full bg-red-50 text-red-600 border border-red-200 text-xs p-3 rounded-xl font-medium">
                {error}
              </div>
            )}

            {/* Boutons d'action */}
            <div className="flex items-center gap-3 w-full mt-2">
              <button
                type="button"
                onClick={handleClose}
                disabled={isLoading}
                className="w-1/2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm p-3 rounded-2xl transition duration-200 disabled:opacity-50"
              >
                Annuler
              </button>

              <button
                type="button"
                onClick={handleDelete}
                disabled={isLoading}
                className="w-1/2 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white font-semibold text-sm p-3 rounded-2xl shadow-lg shadow-red-600/20 transition-all duration-200 hover:shadow-xl active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>En cours...</span>
                  </>
                ) : (
                  confirmButtonText
                )}
              </button>
            </div>
          </>
        ) : (
          /* --- ÉTAPE 2 : Message de succès après suppression --- */
          <>
            <div className="w-20 h-20 bg-gradient-to-tr from-emerald-500 to-green-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-green-500/30 ring-8 ring-green-50 animate-in zoom-in-50 duration-200">
              <Trash2 className="w-10 h-10 stroke-[2.25]" />
            </div>

            <div className="space-y-2 pt-2">
              <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Suppression réussie !
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed max-w-xs mx-auto">
                L'élément a été supprimé définitivement.
              </p>
            </div>

            <button
              type="button"
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm p-3 rounded-2xl shadow-lg transition-all duration-200 active:scale-[0.98] mt-2"
              onClick={handleClose}
            >
              Fermer
            </button>
          </>
        )}
      </div>
    </div>
  );
}
