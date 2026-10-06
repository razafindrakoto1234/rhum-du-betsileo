"use client";

import AuthGuard from "@/components/AuthGuard";
import NetworkStatus from "@/components/NetworkStatus";
import { auth, db } from "@/lib/firebase/firebase";
import { UserData } from "@/types/user";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import {
  ArrowLeftRight,
  Bell,
  Boxes,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  User as UserIcon,
  UserCog,
  Users,
  Warehouse,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactElement, ReactNode, useEffect, useRef, useState } from "react";
import UserModal from "./user/userModal";

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
  { label: "Entrepots", href: "/warehouse", icon: Warehouse },
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

  // Etat du menu déroulant Profil dans le header
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState<boolean>(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Etat pour l'ouverture de la modale de modification de profil
  const [isEditProfileOpen, setIsEditProfileOpen] = useState<boolean>(false);

  // Etat pour stocker les informations de l'admin connecté
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);

  const fetchUserProfile = async (uid: string) => {
    try {
      const docRef = doc(db, "users", uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setUserData(docSnap.data() as UserData);
      }
    } catch (error) {
      console.error("Erreur chargement profil utilisateur :", error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        await fetchUserProfile(user.uid);
      } else {
        setCurrentUser(null);
        setUserData(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // Fermer le menu déroulant au clic à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node)
      ) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    router.replace("/login");
  };

  // Récupérer l'URL de la photo
  const avatarUrl =
    currentUser?.photoURL ||
    (userData as any)?.photoUrl ||
    (userData as any)?.photoURL ||
    (userData as any)?.photo;

  // Calculer les initiales si pas de photo
  const displayName = userData?.name || currentUser?.displayName || "Admin";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  // Objet `UserData` complet pour satisfaire l'interface TypeScript
  const formattedUserData: UserData | null = currentUser
    ? {
        idUser: currentUser.uid,
        name: userData?.name || currentUser.displayName || "",
        mail: userData?.mail || currentUser.email || "",
        smartphone: userData?.smartphone || "",
        photoURL: avatarUrl || "",
        responsability: (userData?.responsability as any) || "Administrateur",
        isBlocked: (userData as any)?.isBlocked ?? false,
        createdAt: (userData as any)?.createdAt || "",
      }
    : null;

  return (
    <AuthGuard>
      <div className="min-h-screen bg-slate-50 flex flex-col">
        {/* Barre de navigation supérieure (Header) */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-50 px-6 py-3.5 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="relative w-9 h-9 rounded-full overflow-hidden border border-slate-200">
              <Image
                src="/rhum_betsileo.jpg"
                alt="Logo Rhum du Betsileo"
                fill
                className="object-cover"
              />
            </div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">
              <span className="text-blue-600 font-normal">
                | Rhum du Betsileo
              </span>
            </h1>
          </div>

          {/* NetworkStatus + Notifications + Profil Admin */}
          <div className="flex items-center gap-4">
            <NetworkStatus />
            <div className="h-4 w-px bg-slate-200" />
            <button className="relative p-2 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition">
              <Bell className="w-5 h-5" />
            </button>

            {/* Zone Profil avec Popover */}
            <div className="relative" ref={profileMenuRef}>
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-100 transition focus:outline-none"
              >
                <div className="relative w-9 h-9 rounded-full overflow-hidden bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-700 font-bold text-xs shrink-0">
                  {avatarUrl ? (
                    <Image
                      src={avatarUrl}
                      alt={displayName}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <span>{initials || <UserIcon className="w-4 h-4" />}</span>
                  )}
                </div>
                <div className="hidden md:flex flex-col text-left">
                  <span className="text-xs font-bold text-slate-800 leading-tight">
                    {displayName}
                  </span>
                  <span className="text-[10px] font-medium text-slate-500">
                    {userData?.responsability || "Administrateur"}
                  </span>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400 hidden md:block" />
              </button>

              {/* Menu déroulant */}
              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-4 py-2 border-b border-slate-100 mb-1">
                    <p className="text-xs font-semibold text-slate-900 truncate">
                      {displayName}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate">
                      {currentUser?.email}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      setIsEditProfileOpen(true);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition text-left"
                  >
                    <UserCog className="w-4 h-4 text-slate-500" />
                    <span>Modifier votre profil</span>
                  </button>

                  <div className="my-1 border-t border-slate-100" />

                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      handleLogout();
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-50 transition text-left"
                  >
                    <LogOut className="w-4 h-4 text-red-500" />
                    <span>Déconnexion</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Corps principal : Sidebar + Contenu */}
        <div className="flex flex-1 p-4 gap-6 items-start">
          {/* Sidebar */}
          <aside
            className={`bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-col justify-between transition-all duration-300 shrink-0 sticky top-20 h-[calc(100vh-89px)] z-30 ${
              isCollapsed ? "w-20" : "w-64"
            }`}
          >
            <div className="flex flex-col flex-1 overflow-hidden">
              <div className="flex items-center gap-3.5 px-2 mb-6 shrink-0">
                <button
                  className="p-1.5 text-slate-700 hover:bg-slate-100 rounded-lg transition"
                  onClick={() => setIsCollapsed(!isCollapsed)}
                >
                  <Menu className="w-6 h-6" />
                </button>
                {!isCollapsed && (
                  <span className="text-xl font-bold text-blue-900 tracking-tight">
                    Espace Admin
                  </span>
                )}
              </div>

              {/* Navigation principale */}
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
                      className={`flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                        isActive
                          ? "bg-blue-600 text-white shadow-blue-500/25"
                          : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                      } ${isCollapsed ? "justify-center px-0" : ""}`}
                    >
                      <Icon
                        className={`w-5 h-5 shrink-0 ${
                          isActive ? "text-white" : "text-slate-500"
                        }`}
                      />
                      {!isCollapsed && <span>{item.label}</span>}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Pied de la Sidebar */}
            <div className="pt-4 border-t border-slate-100 shrink-0">
              <button
                onClick={handleLogout}
                className={`w-full flex items-center gap-4 px-4 py-3 text-slate-500 hover:bg-red-50 hover:text-red-600 rounded-xl text-sm font-semibold transition ${
                  isCollapsed ? "justify-center px-0" : ""
                }`}
              >
                <LogOut className="w-5 h-5 shrink-0" />
                {!isCollapsed && <span>Déconnexion</span>}
              </button>
            </div>
          </aside>

          {/* Contenu dynamique des pages */}
          <main className="flex-1 p-6 max-w-7xl w-full mx-auto">
            {children}
          </main>
        </div>

        {/* MODALE UTILISATEUR */}
        <UserModal
          isOpen={isEditProfileOpen}
          onClose={() => setIsEditProfileOpen(false)}
          onSuccess={() => {
            if (currentUser) {
              fetchUserProfile(currentUser.uid);
            }
          }}
          userToEdit={formattedUserData}
        />
      </div>
    </AuthGuard>
  );
}
