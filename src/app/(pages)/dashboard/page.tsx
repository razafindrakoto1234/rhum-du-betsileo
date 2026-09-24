"use client";

import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { useRouter } from "next/navigation";
import { ReactElement } from "react";

export default function DashboardPage(): ReactElement {
  const router: AppRouterInstance = useRouter();

  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="flex items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Tableau de Bord Administrateur
            </h1>
            <p className="text-sm text-slate-500">
              Bienvenue dans l'espace de gestion Natur'eau
            </p>
          </div>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="text-sm font-medium text-slate-500">
              Points de Vente
            </h3>
            <p className="text-3xl font-extrabold text-slate-900 mt-2">--</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="text-sm font-medium text-slate-500">Référencés</h3>
            <p className="text-3xl font-extrabold text-slate-900 mt-2">--</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="text-sm font-medium text-slate-500">
              Transferts en cours
            </h3>
            <p className="text-3xl font-extrabold text-slate-900 mt-2">--</p>
          </div>
        </div>
      </div>
    </div>
  );
}
