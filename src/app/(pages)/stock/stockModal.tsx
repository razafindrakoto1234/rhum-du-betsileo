"use client";

import { useState, useEffect } from "react";
import { X, Loader2, PackagePlus, Edit3 } from "lucide-react";
import { ProductData } from "@/types/product";
import { ProductCapacityData } from "@/types/productCapacity";
import { createStock } from "@/lib/service/stock/create-stock-service";
import { updateStock } from "@/lib/service/stock/update-stock-service";
import AddModalConfirmation from "@/components/confirmation/addModalConfirmation";
import UpdateModalConfirmation from "@/components/confirmation/updateModalConfirmation";

interface StockModalProps {
  isOpen: boolean;
  onClose: () => void;
  warehouseId: string;
  warehouseName?: string;
  product: ProductData | null;
  initialCapacityId?: string;
  currentStockMap?: Record<
    string,
    { carton: number; bottle: number; total: number }
  >;
  onSuccess: () => void;
}

function getBottlesPerCarton(capacityStr: string): number {
  const cap = capacityStr.toLowerCase();
  if (cap.includes("75") || cap.includes("75cl")) return 9;
  if (cap.includes("25") || cap.includes("25cl")) return 30;
  if (cap.includes("1l") || cap.includes("100cl")) return 6;
  return 1;
}

export default function StockModal({
  isOpen,
  onClose,
  warehouseId,
  warehouseName,
  product,
  initialCapacityId,
  currentStockMap,
  onSuccess,
}: StockModalProps) {
  const [selectedCapacityId, setSelectedCapacityId] = useState<string>("");
  const [cartonQuantity, setCartonQuantity] = useState<number | "">("");
  const [bottleQuantity, setBottleQuantity] = useState<number | "">("");

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [showAddConfirmation, setShowAddConfirmation] =
    useState<boolean>(false);
  const [showUpdateConfirmation, setShowUpdateConfirmation] =
    useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen && product) {
      setError("");
      setShowAddConfirmation(false);
      setShowUpdateConfirmation(false);

      if (initialCapacityId) {
        setSelectedCapacityId(initialCapacityId);
      } else if (product.capacities && product.capacities.length > 0) {
        setSelectedCapacityId(product.capacities[0].idCapacity || "cap-0");
      } else {
        setSelectedCapacityId("");
      }
    }
  }, [isOpen, product, initialCapacityId]);

  useEffect(() => {
    if (selectedCapacityId && currentStockMap && product) {
      const stockKey = `${product.idProduct}_${selectedCapacityId}`;
      const existing = currentStockMap[stockKey];

      if (existing) {
        setCartonQuantity(existing.carton);
        setBottleQuantity(existing.bottle);
        setIsEditing(true);
      } else {
        setCartonQuantity("");
        setBottleQuantity("");
        setIsEditing(false);
      }
    }
  }, [selectedCapacityId, currentStockMap, product]);

  if (!isOpen || !product) return null;

  // Recherche sécurisée de la capacité sélectionnée
  const selectedCap = product.capacities?.find(
    (c, idx) => (c.idCapacity || `cap-${idx}`) === selectedCapacityId,
  );
  const capacityText = selectedCap?.capacity || "";
  const bottlesPerCarton = getBottlesPerCarton(capacityText);

  const cartonsNum = Number(cartonQuantity) || 0;
  const bottlesNum = Number(bottleQuantity) || 0;
  const totalCalculated = cartonsNum * bottlesPerCarton + bottlesNum;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!warehouseId || !selectedCapacityId) {
      setError("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    const payload = {
      idWarehouse: warehouseId,
      idProduct: product.idProduct,
      idCapacity: selectedCapacityId,
      cartonQuantity: cartonsNum,
      bottleQuantity: bottlesNum,
    };

    try {
      setLoading(true);
      if (isEditing) {
        await updateStock(payload);
        setShowUpdateConfirmation(true);
      } else {
        await createStock(payload);
        setShowAddConfirmation(true);
      }
    } catch (err: any) {
      console.error("Erreur sauvegarde stock:", err);
      setError(err.message || "Erreur lors de la sauvegarde.");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseConfirmation = () => {
    setShowAddConfirmation(false);
    setShowUpdateConfirmation(false);
    onSuccess();
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2.5">
              <div
                className={`p-2 rounded-xl ${isEditing ? "bg-amber-50 text-amber-600" : "bg-blue-50 text-blue-600"}`}
              >
                {isEditing ? (
                  <Edit3 className="w-5 h-5" />
                ) : (
                  <PackagePlus className="w-5 h-5" />
                )}
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  {isEditing ? "Modifier le Stock" : "Initialiser le Stock"}
                </h2>
                <p className="text-xs text-slate-500">
                  {warehouseName
                    ? `Dépôt : ${warehouseName}`
                    : `Dépôt #${warehouseId.substring(0, 8)}`}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3.5">
            <span className="text-[10px] font-bold uppercase text-slate-400">
              Produit
            </span>
            <h3 className="text-sm font-bold text-slate-800">{product.name}</h3>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-100 text-rose-700 rounded-xl text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Contenance / Format
              </label>
              <select
                value={selectedCapacityId}
                onChange={(e) => setSelectedCapacityId(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900"
              >
                <option value="">Sélectionner un format</option>
                {product.capacities?.map(
                  (cap: ProductCapacityData, idx: number) => {
                    const capId = cap.idCapacity || `cap-${idx}`;
                    return (
                      <option key={capId} value={capId}>
                        {cap.capacity} — Ar {cap.price?.toLocaleString("fr-FR")}
                      </option>
                    );
                  },
                )}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Cartons
                </label>
                <input
                  type="number"
                  min={0}
                  value={cartonQuantity}
                  onChange={(e) =>
                    setCartonQuantity(
                      e.target.value === "" ? "" : Number(e.target.value),
                    )
                  }
                  placeholder="ex: 10"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Bouteilles (vrac)
                </label>
                <input
                  type="number"
                  min={0}
                  value={bottleQuantity}
                  onChange={(e) =>
                    setBottleQuantity(
                      e.target.value === "" ? "" : Number(e.target.value),
                    )
                  }
                  placeholder="ex: 0"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900"
                />
              </div>
            </div>

            {selectedCap && (
              <div className="bg-blue-50/70 border border-blue-100 rounded-2xl p-3 text-xs text-blue-900 flex flex-col gap-1">
                <span className="font-semibold text-blue-800">
                  Règle ({capacityText} : 1 carton = {bottlesPerCarton} btls) :
                </span>
                <span className="font-bold text-blue-700">
                  {cartonsNum} carton(s) ({cartonsNum * bottlesPerCarton} btls)
                  + {bottlesNum} btl(s) ={" "}
                  <span className="underline">
                    {totalCalculated} bouteilles au total
                  </span>
                </span>
              </div>
            )}

            <div className="flex items-center gap-3 pt-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`flex-1 py-2.5 text-white rounded-xl text-xs font-semibold transition flex items-center justify-center gap-2 shadow-md ${
                  isEditing
                    ? "bg-amber-600 hover:bg-amber-700"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Sauvegarde...</span>
                  </>
                ) : (
                  <span>{isEditing ? "Mettre à jour" : "Créer le stock"}</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      <AddModalConfirmation
        isOpen={showAddConfirmation}
        onClose={handleCloseConfirmation}
        title="Stock Initialisé !"
        message={`Le stock contient ${cartonsNum} carton(s) et ${bottlesNum} bouteille(s) (Total : ${totalCalculated} btls).`}
      />

      <UpdateModalConfirmation
        isOpen={showUpdateConfirmation}
        onClose={handleCloseConfirmation}
        title="Stock Mis à jour !"
        message={`Le stock a été mis à jour avec ${cartonsNum} carton(s) et ${bottlesNum} bouteille(s) (Total : ${totalCalculated} btls).`}
      />
    </>
  );
}
