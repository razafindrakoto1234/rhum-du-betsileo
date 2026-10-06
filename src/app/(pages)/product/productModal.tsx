"use client";

import AddModalConfirmation from "@/components/confirmation/addModalConfirmation";
import UpdateModalConfirmation from "@/components/confirmation/updateModalConfirmation";
import { createProduct } from "@/lib/service/product/create-product-service";
import { updateProductSerice } from "@/lib/service/product/update-product-service";
import { CreateProductInput, ProductData } from "@/types/product";
import { ProductCapacityData } from "@/types/productCapacity";
import {
  AlertCircle,
  Image as ImageIcon,
  Loader2,
  Package,
  Plus,
  QrCode,
  Tag,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import React, { useEffect, useState } from "react";

interface ProductModalProps {
  isOpen: boolean;
  productToEdit?: ProductData | null;
  onClose?: () => void;
  onSuccess?: () => void;
}

export default function ProductModal({
  isOpen,
  productToEdit = null,
  onClose,
  onSuccess,
}: ProductModalProps) {
  const isEditing = Boolean(productToEdit);

  // Formulaire Produit
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageURL, setImageURL] = useState("");

  // Liste des capacités associées au produit
  const [capacities, setCapacities] = useState<ProductCapacityData[]>([
    { capacity: "1L", price: 0, status: "AVAILABLE" },
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modales de confirmation
  const [showAddSuccessModal, setShowAddSuccessModal] = useState(false);
  const [showUpdateSuccessModal, setShowUpdateSuccessModal] = useState(false);
  const [confirmedProductName, setConfirmedProductName] = useState("");

  // Pré-remplissage lors de l'édition
  useEffect(() => {
    if (productToEdit) {
      setName(productToEdit.name || "");
      setDescription(productToEdit.description || "");
      setImageURL(productToEdit.imageURL || "");
      setCapacities(
        productToEdit.capacities?.length
          ? productToEdit.capacities
          : [{ capacity: "1L", price: 0, status: "AVAILABLE" }],
      );
    } else {
      resetForm();
    }
  }, [productToEdit, isOpen]);

  const resetForm = () => {
    setName("");
    setDescription("");
    setImageURL("");
    setCapacities([{ capacity: "1L", price: 0, status: "AVAILABLE" }]);
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    setShowAddSuccessModal(false);
    setShowUpdateSuccessModal(false);
    if (onClose) onClose();
  };

  // Upload d'image
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setImageURL(reader.result as string);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  // --- GESTION DES CAPACITÉS (DYNAMIQUE) ---
  const handleAddCapacity = () => {
    setCapacities((prev) => [
      ...prev,
      { capacity: "", price: 0, status: "AVAILABLE", qrCode: "" },
    ]);
  };

  const handleRemoveCapacity = (index: number) => {
    if (capacities.length <= 1) {
      setError("Un produit doit comporter au moins une capacité.");
      return;
    }
    setCapacities((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCapacityChange = (
    index: number,
    field: keyof ProductCapacityData,
    value: any,
  ) => {
    setCapacities((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [field]: field === "price" ? (value === "" ? 0 : Number(value)) : value,
      };
      return updated;
    });
  };

  // --- SOUMISSION DU FORMULAIRE ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Le nom du produit est obligatoire.");
      return;
    }

    if (!capacities.length) {
      setError("Veuillez ajouter au moins une capacité.");
      return;
    }

    // Validation des champs des capacités
    for (let i = 0; i < capacities.length; i++) {
      const cap = capacities[i];
      if (!cap.capacity.trim()) {
        setError(`Veuillez préciser la contenance pour la variante #${i + 1}.`);
        return;
      }
      if (cap.price < 0) {
        setError(`Le prix de la capacité '${cap.capacity}' doit être positif.`);
        return;
      }
    }

    setLoading(true);

    try {
      if (isEditing && productToEdit?.idProduct) {
        await updateProductSerice({
          idProduct: productToEdit.idProduct,
          name: name.trim(),
          description: description.trim(),
          imageURL,
          capacities,
        });

        setConfirmedProductName(name);
        resetForm();
        if (onSuccess) onSuccess();
        setShowUpdateSuccessModal(true);
      } else {
        const payload: CreateProductInput = {
          name: name.trim(),
          description: description.trim(),
          imageURL,
          capacities,
        };
        await createProduct(payload);

        setConfirmedProductName(name);
        resetForm();
        if (onSuccess) onSuccess();
        setShowAddSuccessModal(true);
      }
    } catch (err: any) {
      setError(
        err.message ||
          `Erreur lors de la ${
            isEditing ? "modification" : "création"
          } du produit.`,
      );
    } finally {
      setLoading(false);
    }
  };

  // Gestion du scroll du body et touche Échap
  useEffect(() => {
    const isAnyModalOpen =
      isOpen || showAddSuccessModal || showUpdateSuccessModal;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isAnyModalOpen) {
        handleClose();
      }
    };

    if (isAnyModalOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, showAddSuccessModal, showUpdateSuccessModal]);

  if (!isOpen && !showAddSuccessModal && !showUpdateSuccessModal) return null;

  return (
    <>
      {isOpen && !showAddSuccessModal && !showUpdateSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-100 overflow-hidden my-8">
            {/* En-tête */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    {isEditing ? "Modifier le produit" : "Nouveau Produit"}
                  </h2>
                  <p className="text-xs text-slate-500">
                    {isEditing
                      ? "Mettre à jour les informations et capacités"
                      : "Créer un produit avec ses différentes capacités"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Formulaire */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {error && (
                <div className="flex items-center gap-3 p-3.5 bg-rose-50 border border-rose-100 text-rose-700 rounded-xl text-sm">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* SECTION PRODUIT GLOBAL */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Informations générales
                </h3>

                {/* Image */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Image du produit
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-slate-50 border border-slate-200 rounded-xl overflow-hidden flex items-center justify-center shrink-0">
                      {imageURL ? (
                        <img
                          src={imageURL}
                          alt="Aperçu"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ImageIcon className="w-6 h-6 text-slate-300" />
                      )}
                    </div>

                    <div>
                      <label className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl cursor-pointer transition">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Choisir une image</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          disabled={loading}
                          className="hidden"
                        />
                      </label>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Formats : PNG, JPG, WEBP (Max 2 Mo)
                      </p>
                    </div>
                  </div>
                </div>

                {/* Nom */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nom du produit <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Canelle"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={loading}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600 transition"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    disabled={loading}
                    rows={2}
                    placeholder="Description du produit..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600 transition resize-none"
                  />
                </div>
              </div>

              {/* SECTION DYNAMIQUE DES CAPACITÉS */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Formats / Capacités & Prix
                  </h3>
                  <button
                    type="button"
                    onClick={handleAddCapacity}
                    disabled={loading}
                    className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-xl transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Ajouter une capacité</span>
                  </button>
                </div>

                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                  {capacities.map((cap, index) => (
                    <div
                      key={index}
                      className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl space-y-3 relative"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {/* Contenance */}
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Contenance <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            placeholder="Ex: 0.5L, 1.5L"
                            value={cap.capacity}
                            onChange={(e) =>
                              handleCapacityChange(
                                index,
                                "capacity",
                                e.target.value,
                              )
                            }
                            disabled={loading}
                            className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                            required
                          />
                        </div>

                        {/* Prix */}
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Prix (Ar) <span className="text-rose-500">*</span>
                          </label>
                          <div className="relative">
                            <Tag className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                              type="number"
                              placeholder="Ex: 2000"
                              value={cap.price || ""}
                              onChange={(e) =>
                                handleCapacityChange(
                                  index,
                                  "price",
                                  e.target.value,
                                )
                              }
                              disabled={loading}
                              className="w-full pl-8 pr-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                              required
                            />
                          </div>
                        </div>

                        {/* Statut */}
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Statut
                          </label>
                          <select
                            value={cap.status || "AVAILABLE"}
                            onChange={(e) =>
                              handleCapacityChange(
                                index,
                                "status",
                                e.target.value,
                              )
                            }
                            disabled={loading}
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                          >
                            <option value="AVAILABLE">Disponible</option>
                            <option value="OUT_OF_STOCK">Rupture</option>
                            <option value="DISCONTINUED">Obsolète</option>
                          </select>
                        </div>
                      </div>

                      {/* Code-barres / QR Code & Bouton Suppression */}
                      <div className="flex items-center gap-3">
                        {capacities.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveCapacity(index)}
                            disabled={loading}
                            className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition"
                            title="Supprimer cette capacité"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Boutons d'action */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={loading}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition disabled:opacity-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-500/20 transition disabled:opacity-50"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>
                    {loading
                      ? isEditing
                        ? "Mise à jour..."
                        : "Création..."
                      : isEditing
                        ? "Enregistrer les modifications"
                        : "Enregistrer le produit"}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation après AJOUT */}
      <AddModalConfirmation
        isOpen={showAddSuccessModal}
        onClose={handleClose}
        title="Produit ajouté !"
        message={`Le produit "${confirmedProductName}" avec ses capacités a été ajouté au catalogue.`}
        buttonText="Continuer"
      />

      {/* Confirmation après MODIFICATION */}
      <UpdateModalConfirmation
        isOpen={showUpdateSuccessModal}
        onClose={handleClose}
        title="Modifications enregistrées !"
        message={`Le produit "${confirmedProductName}" a été mis à jour avec succès.`}
        buttonText="Compris"
      />
    </>
  );
}
