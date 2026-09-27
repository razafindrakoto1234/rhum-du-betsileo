"use client";

import AddModalConfirmation from "@/components/confirmation/addModalConfirmation";
import UpdateModalConfirmation from "@/components/confirmation/updateModalConfirmation";
import {
  createProduct,
  CreateProductData,
} from "@/lib/service/product/create-product-service";
import { ProductData } from "@/lib/service/product/get-products-service";
import { updateProductSerice } from "@/lib/service/product/update-product-service";
import {
  AlertCircle,
  Image as ImageIcon,
  Loader2,
  Package,
  QrCode,
  Tag,
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

  const [formData, setFormData] = useState<CreateProductData>({
    name: "",
    capacity: "",
    description: "",
    price: 0,
    status: "AVAILABLE",
    imageURL: "",
    qrCode: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // États pour les modales de confirmation
  const [showAddSuccessModal, setShowAddSuccessModal] = useState(false);
  const [showUpdateSuccessModal, setShowUpdateSuccessModal] = useState(false);
  const [confirmedProductName, setConfirmedProductName] = useState("");

  // Préremplissage des champs en mode modification
  useEffect(() => {
    if (productToEdit) {
      setFormData({
        name: productToEdit.name || "",
        capacity: productToEdit.capacity || "",
        description: productToEdit.description || "",
        price: productToEdit.price || 0,
        status: productToEdit.status || "AVAILABLE",
        imageURL: productToEdit.imageURL || "",
        qrCode: productToEdit.qrCode || "",
      });
    } else {
      resetForm();
    }
  }, [productToEdit, isOpen]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "price" ? (value === "" ? 0 : Number(value)) : value,
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({
        ...prev,
        imageURL: reader.result as string,
      }));
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      capacity: "",
      description: "",
      price: 0,
      status: "AVAILABLE",
      imageURL: "",
      qrCode: "",
    });
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    setShowAddSuccessModal(false);
    setShowUpdateSuccessModal(false);
    if (onClose) onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.name.trim()) {
      setError("Le nom du produit est obligatoire.");
      return;
    }

    setLoading(true);

    try {
      if (isEditing && productToEdit?.id) {
        // Mode Modification
        await updateProductSerice({
          idProduct: productToEdit.id,
          name: formData.name,
          capacity: formData.capacity,
          description: formData.description,
          price: formData.price,
          imageURL: formData.imageURL,
        });

        setConfirmedProductName(formData.name);
        resetForm();

        if (onSuccess) onSuccess();
        setShowUpdateSuccessModal(true);
      } else {
        // Mode Création
        await createProduct(formData);

        setConfirmedProductName(formData.name);
        resetForm();

        if (onSuccess) onSuccess();
        setShowAddSuccessModal(true);
      }
    } catch (err: any) {
      setError(
        err.message ||
          `Une erreur est survenue lors de la ${
            isEditing ? "modification" : "création"
          } du produit.`,
      );
    } finally {
      setLoading(false);
    }
  };

  // Gestion du scroll du body et de la touche Échap
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
      {/* Modal principale de formulaire */}
      {isOpen && !showAddSuccessModal && !showUpdateSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden my-8">
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
                      ? "Mettre à jour les informations de cet article"
                      : "Ajouter une boisson au catalogue général"}
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
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="flex items-center gap-3 p-3.5 bg-rose-50 border border-rose-100 text-rose-700 rounded-xl text-sm">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Section Image */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Image du produit
                </label>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-slate-50 border border-slate-200 rounded-xl overflow-hidden flex items-center justify-center shrink-0 relative">
                    {formData.imageURL ? (
                      <img
                        src={formData.imageURL}
                        alt="Aperçu"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-slate-300" />
                    )}
                  </div>

                  <div className="flex-1">
                    <label className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl cursor-pointer transition">
                      <Upload className="w-4 h-4" />
                      <span>Choisir une image</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={loading}
                        className="hidden"
                      />
                    </label>
                    <p className="text-[11px] text-slate-400 mt-1.5">
                      Formats acceptés : PNG, JPG, WEBP. Max 2 Mo.
                    </p>
                  </div>
                </div>
              </div>

              {/* Nom & Contenance */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nom du produit <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Natur'eau"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={loading}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600 transition"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Contenance
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: 0.5L, 1L, 65cl"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleChange}
                    disabled={loading}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600 transition"
                  />
                </div>
              </div>

              {/* Prix & Statut */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Prix unitaire (Ar) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Tag className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="number"
                      placeholder="Ex: 4500"
                      name="price"
                      value={formData.price || ""}
                      onChange={handleChange}
                      disabled={loading}
                      className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600 transition"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Statut initial
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    disabled={loading}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600 transition"
                  >
                    <option value="AVAILABLE">Disponible</option>
                    <option value="OUT_OF_STOCK">Rupture de stock</option>
                    <option value="DISCONTINUED">Obsolète</option>
                  </select>
                </div>
              </div>

              {/* Code-barres / QR Code */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Code-barres / Code QR (Optionnel)
                </label>
                <div className="relative">
                  <QrCode className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    name="qrCode"
                    value={formData.qrCode}
                    onChange={handleChange}
                    disabled={loading}
                    placeholder="Ex: COC-1L-001"
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600 transition font-mono"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description (Optionnelle)
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  disabled={loading}
                  rows={3}
                  placeholder="Description ou détails de conditionnement..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600 transition resize-none"
                />
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
        message={`Le produit "${confirmedProductName}" a été ajouté avec succès au catalogue.`}
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
