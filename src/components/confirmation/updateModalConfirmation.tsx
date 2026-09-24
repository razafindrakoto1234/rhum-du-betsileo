"use client";

import { Check, Edit3, X } from "lucide-react";

interface UpdateModalConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  buttonText?: string;
}

export default function UpdateModalConfirmation({
  isOpen,
  onClose,
  title = "Modifications enregistrées !",
  message = "Les informations ont été mises à jour avec succès.",
  buttonText = "Compris",
}: UpdateModalConfirmationProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md transition-all duration-300 animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 flex flex-col items-center text-center space-y-5 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition"
          onClick={onClose}
          aria-label="Fermer"
        >
          <X className="w-5 h-5" />
        </button>

        {/** Badge visuel de mise à jour (Blue / Indigo) */}
        <div className="relative">
          <div className="w-20 h-20 bg-gradient-to-tr from-blue-600 to-indigo-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-blue-500/30 ring-8 ring-blue-50">
            <Check className="w-10 h-10 stroke-[3]" />
          </div>

          {/** Pastille indiquant l'édition */}
          <span className="absolute -bottom-1 -right-1 bg-amber-500 text-white p-2 rounded-full border-2 border-white shadow-md">
            <Edit3 className="w-4 h-4 stroke-[2.5]" />
          </span>
        </div>

        {/** Textes dynamiques */}
        <div className="space-y-2 pt-2">
          <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
            {title}
          </h3>
          <p className="text-sm text-slate-500 leading-relaxed max-w-xs mx-auto">
            {message}
          </p>
        </div>

        {/** Bouton d'action principal */}
        <button
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-sm p-3 rounded-2xl shadow-lg shadow-blue-600/20 transition-all duration-200 hover:shadow-xl active:scale-[0.98] mt-2"
          onClick={onClose}
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
}
