"use client";

import AddModalConfirmation from "@/components/confirmation/addModalConfirmation";
import UpdateModalConfirmation from "@/components/confirmation/updateModalConfirmation";
import { createWarehouse } from "@/lib/service/warehouse/create-warehouse-service";
import { UpdateWarehouseService } from "@/lib/service/warehouse/update-warehouse-service";
import {
  CreateWarehouseInput,
  WarehouseData,
  WarehouseStatus,
} from "@/types/warehouse";
import { Building2, Boxes, Loader2, MapPin, X } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";

interface WarehouseModalProps {
  isOpen: boolean;
  WarehouseToEdit?: WarehouseData | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function WarehouseModal({
  isOpen,
  WarehouseToEdit = null,
  onClose,
  onSuccess,
}: WarehouseModalProps) {
  const isEditing = Boolean(WarehouseToEdit);

  const [name, setName] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [capacityMax, setCapacityMax] = useState<number | "">("");
  const [status, setStatus] = useState<WarehouseStatus>("ACTIVE");

  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  const [showUpdateSuccessModal, setShowUpdateSuccessModal] =
    useState<boolean>(false);
  const [confirmedWarehouseName, setConfirmedWarehouseName] =
    useState<string>("");

  const resetForm = () => {
    setName("");
    setLocation("");
    setCapacityMax("");
    setStatus("ACTIVE");
    setErrorMessage("");
  };

  const handleClose = () => {
    resetForm();
    setShowSuccessModal(false);
    setShowUpdateSuccessModal(false);
    onClose();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setLoading(true);

    try {
      if (isEditing && WarehouseToEdit?.idWarehouse) {
        await UpdateWarehouseService({
          idWarehouse: WarehouseToEdit.idWarehouse,
          name: name.trim(),
          location: location.trim(),
          capacityMax: capacityMax !== "" ? Number(capacityMax) : 0,
          status,
        });

        // 1. On sauvegarde d'abord le nom du dépôt
        const updatedName = name.trim();
        setConfirmedWarehouseName(updatedName);

        // 2. On déclenche la modale de succès d'abord
        setShowUpdateSuccessModal(true);

        // 3. On informe le parent
        if (onSuccess) onSuccess();
      } else {
        const payload: CreateWarehouseInput = {
          name: name.trim(),
          location: location.trim() || undefined,
          capacityMax: capacityMax !== "" ? Number(capacityMax) : undefined,
          status,
        };

        await createWarehouse(payload);

        setShowSuccessModal(true);

        if (onSuccess) {
          onSuccess();
        }
      }
    } catch (error: unknown) {
      console.error("Erreur handleSubmit warehouse :", error);
      const err = error as Error;
      setErrorMessage(
        err.message ||
          `Une erreur est survenue lors de la ${isEditing ? "modification" : "création"} du dépôt.`,
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      if (WarehouseToEdit) {
        setName(WarehouseToEdit.name || "");
        setLocation(WarehouseToEdit.location || "");
        setCapacityMax(
          WarehouseToEdit.capacityMax !== undefined &&
            WarehouseToEdit.capacityMax !== null
            ? WarehouseToEdit.capacityMax
            : "",
        );
        setStatus(WarehouseToEdit.status || "ACTIVE");
      } else {
        resetForm();
      }
    }
  }, [isOpen, WarehouseToEdit]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "Escape" &&
        (isOpen || showSuccessModal || showUpdateSuccessModal)
      ) {
        handleClose();
      }
    };

    if (isOpen || showSuccessModal || showUpdateSuccessModal) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, showSuccessModal, showUpdateSuccessModal]);

  // Si aucune des modales n'est ouverte, on ne rend rien
  if (!isOpen && !showSuccessModal && !showUpdateSuccessModal) return null;

  return (
    <>
      {/* Modale Principale de Formulaire */}
      {isOpen && !showSuccessModal && !showUpdateSuccessModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    {isEditing ? "Modifier le dépôt" : "Nouveau Dépôt"}
                  </h2>
                  <p className="text-xs text-slate-400">
                    {isEditing
                      ? "Modifier les informations de l'entrepôt existant"
                      : "Ajouter un nouvel entrepôt ou point de stockage"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                aria-label="Fermer la fenêtre"
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 text-xs rounded-xl leading-relaxed">
                {errorMessage}
              </div>
            )}

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nom du dépôt
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="ex: Dépôt Principal - Ambalavao"
                    disabled={loading}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Localisation{" "}
                  <span className="text-slate-400 font-normal">
                    (optionnel)
                  </span>
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="ex: Cave de Maturation"
                    disabled={loading}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Capacité maximale{" "}
                  <span className="text-slate-400 font-normal">
                    (optionnel)
                  </span>
                </label>
                <div className="relative">
                  <Boxes className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="number"
                    min={0}
                    value={capacityMax}
                    onChange={(e) =>
                      setCapacityMax(
                        e.target.value === "" ? "" : Number(e.target.value),
                      )
                    }
                    placeholder="ex: 5000"
                    disabled={loading}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Statut
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as WarehouseStatus)}
                  disabled={loading}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600 transition"
                >
                  <option value="ACTIVE">Actif</option>
                  <option value="INACTIVE">Inactif</option>
                  <option value="FULL">Saturé / Plein (FULL)</option>
                </select>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={loading}
                  className="flex-1 py-3 border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50 transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>
                    {loading
                      ? isEditing
                        ? "Mise à jour..."
                        : "Création..."
                      : isEditing
                        ? "Enregistrer les modifications"
                        : "Enregistrer l'entrepôt"}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Création */}
      <AddModalConfirmation
        isOpen={showSuccessModal}
        onClose={handleClose}
        title="Dépôt créé !"
        message={`Le dépôt "${name}" a été ajouté au système avec succès.`}
        buttonText="Continuer"
      />

      {/* Confirmation Modification */}
      <UpdateModalConfirmation
        isOpen={showUpdateSuccessModal}
        onClose={handleClose}
        title="Modifications enregistrées !"
        message={`L'entrepôt "${confirmedWarehouseName}" a été mis à jour avec succès.`}
        buttonText="Compris"
      />
    </>
  );
}
