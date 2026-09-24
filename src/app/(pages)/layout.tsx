"use client";

import AuthGuard from "@/components/AuthGuard";
import NetworkStatus from "@/components/NetworkStatus";
import { signOut } from "firebase/auth";
import {
  ArrowLeftRight,
  Bell,
  Boxes,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Users,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { ReactElement, ReactNode, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { auth } from "@/lib/firebase/firebase";

interface PagesLayoutProps {
  readonly children: ReactNode;
}

interface NavItem {
  readonly label: string;
  readonly href: string;
  readonly icon: typeof LayoutDashboard;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Tableau de bord", href: "/dashboard", icon: LayoutDashboard },
  { label: "Utilisateurs", href: "/user", icon: Users },
  { label: "Produits", href: "/product", icon: Package },
  { label: "Dépôts & Stocks", href: "/depos", icon: Boxes },
  { label: "Transfert", href: "/transfer", icon: ArrowLeftRight },
];

export default function PagesLayout({
  children,
}: PagesLayoutProps): ReactElement {
  const router = useRouter();
  const rawPathname = usePathname();
  const pathname = rawPathname ?? "";

  // Etat pour réduire/agrandir la sidebar
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  const handleLogout = async () => {
    await signOut(auth);
    router.replace("/login");
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-slate-50 flex flex-col">
        {/* Barre de navigation supérieure (Header) */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-50 px-6 py-3.5 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="relative w-9 h-9 rounded-full overflow-hidden border border-slate-200">
              <Image
                src="/ice.jpg"
                alt="image produit"
                fill
                className="object-cover"
              />
            </div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">
              <span className="text-blue-600 font-normal">| Espace Admin</span>
            </h1>
          </div>

          {/* Affichage du composant NetworkStatus et du bouton de déconnexion */}
          <div className="flex items-center gap-4">
            <NetworkStatus />
            <div className="h-4 w-px bg-slate-200" /> {/* Séparateur visuel */}
            <button className="relative p-2 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition">
              <Bell className="w-5 h-5" />
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-slate-500 hover:text-red-600 text-xs font-semibold transition px-3 py-1.5 rounded-lg hover:bg-slate-100"
            >
              <LogOut className="w-4 h-4" />
              Déconnexion
            </button>
          </div>
        </header>

        {/* Corps principal : Sidebar + Contenu */}
        <div className="flex flex-1 p-4 gap-6 items-start">
          {/* Sidebar */}
          <aside
            className={`bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-col justify-between transition-all duration-300 shrink-0  sticky top-20 h-[calc(100vh-89px)] z-30 ${isCollapsed ? "w-20" : "w-64"}`}
          >
            <div className="flex flex-col flex-1 overflow-hidden">
              {/* En-tête de la Sidebar avec le menu burger */}
              <div className="flex items-center gap-3.5 px-2 mb-6 shrink-0">
                <button
                  className="p-1.5 text-slate-700 hover:bg-slate-100 rounded-lg transition"
                  onClick={() => setIsCollapsed(!isCollapsed)}
                >
                  <Menu className="w-6 h-6" />
                </button>
                {!isCollapsed && (
                  <span className="text-xl font-bold text-blue-900 tracking-tight">
                    Natur'eau
                  </span>
                )}
              </div>

              {/* Navigation principal */}
              <nav className="space-y-2 overflow-y-auto pr-1">
                {NAV_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    item.href === "/"
                      ? pathname === "/"
                      : pathname.startsWith(item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      title={isCollapsed ? item.label : undefined}
                      className={`flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${isActive ? "bg-blue-600 text-white shadow-blue-500/25" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"} ${isCollapsed ? "justify-center px-0" : ""}`}
                    >
                      <Icon
                        className={`w-5 h-5 shrink-0 ${isActive ? "text-white" : "text-slate-500"}`}
                      />
                      {!isCollapsed && <span>{item.label}</span>}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Pied de la Sidebar : Déconnexion rapide */}
            <div className="pt-4 border-t border-slate-100 shrink-0">
              <button
                onClick={handleLogout}
                className={`w-full flex items-center gap-4 px-4 py-3 text-slate-500 hover:bg-red-50 hover:text-red-600 rounded-xl text-sm font-semibold transition ${isCollapsed ? "justify-center px-0" : ""}`}
              >
                <LogOut className="w-5 h-5 shrink-0" />
                {!isCollapsed && <span>Déconnexion</span>}
              </button>
            </div>
          </aside>

          {/* Contenu dynamique des pages (Produits, Stocks, etc.) */}
          <main className="flex-1 p-6 max-w-7xl w-full mx-auto">
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
