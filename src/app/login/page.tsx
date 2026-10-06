"use client";

import { fetchApprovedAdmins } from "@/lib/service/user/fetch-user-admin-service";
import { loginAdmin } from "@/lib/service/authService";
import { UserData } from "@/types/user";
import {
  ChevronDown,
  Eye,
  EyeOff,
  Loader2,
  LogIn,
  UserPlus,
} from "lucide-react";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";

// Typer les items de la liste de fonctionnalités
interface FeatureItem {
  id: number;
  text: string;
}

const FEATURES: FeatureItem[] = [
  { id: 1, text: "Suivi en temps réel des stocks et transferts" },
  { id: 2, text: "Tableau de bord synthétique et rapide" },
  { id: 3, text: "Gestion centralisées des utilisateurs et points de vente" },
];

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // LOGIQUE DE SÉLECTION D'ADMINISTRATEUR
  const [admins, setAdmins] = useState<UserData[]>([]);
  const [loadingAdmins, setLoadingAdmins] = useState<boolean>(true);
  const [selectedAdminId, setSelectedAdminId] = useState<string>("");

  // État d'ouverture du custom dropdown
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const router: AppRouterInstance = useRouter();

  // Charger la liste des administrateurs au chargement du composant
  useEffect(() => {
    const loadAdmins = async () => {
      setLoadingAdmins(true);
      try {
        const adminList = await fetchApprovedAdmins();
        setAdmins(adminList);
        if (adminList.length > 0) {
          setSelectedAdminId(adminList[0].idUser);
        }
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Erreur lors du chargement des administrateurs.");
        }
      } finally {
        setLoadingAdmins(false);
      }
    };

    loadAdmins();
  }, []);

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

  const handleGoToRequestAdmin = () => {
    router.push("/request-account");
  };

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setPassword(e.target.value);
  };

  const togglePasswordVisibility = (): void => {
    setShowPassword((prev: boolean) => !prev);
  };

  const selectedAdmin = admins.find(
    (admin) => admin.idUser === selectedAdminId,
  );

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError(null);

    if (!selectedAdmin || !selectedAdmin.mail) {
      setError("Veuillez sélectionner un compte administrateur.");
      return;
    }

    setIsLoading(true);

    try {
      await loginAdmin(selectedAdmin.mail, password);
      router.replace("/dashboard");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Une erreur inattendue s'est produite.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center p-6 md:p-12">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center gap-3">
            <div className=" flex items-center gap-6">
              <Image
                src="/rhum.jpg"
                alt="Rhum du Betsileo"
                width={96}
                height={96}
                className="object-contain"
                priority
              />
            </div>
          </div>

          <div className="space-y-2">
            <span className="inline-block bg-blue-100 text-blue-800 font-bold text-xs px-3 py-1 rounded-full border border-blue-200">
              Espace de gestion
            </span>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight">
              Bonjour Madame/Monsieur l'Admin
            </h1>
          </div>

          <p>
            Accédez au panneau de contrôle pour gérer vos stocks, suivre les
            points de vente et piloter la distribution en toute simplicité.
          </p>

          <ul className="space-y-3 pt-2 text-slate-700 text-sm font-medium">
            {FEATURES.map((feature) => (
              <li key={feature.id} className="flex items-center gap-3">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                  ✓
                </span>
                {feature.text}
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-5 w-full max-w-md justify-self-center lg:justify-self-end">
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-3xl p-8 shadow-xl border border-slate-200 space-y-6"
          >
            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-slate-900">Connexion</h2>
              <p className="text-xs text-slate-500">
                Veuillez entrer vos identifiants pour continuer
              </p>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-medium">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Compte Administrateur
                </label>
                {loadingAdmins ? (
                  <div className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-400 flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                    <span>Chargement des administrateurs...</span>
                  </div>
                ) : (
                  /* Custom Dropdown au design stylé */
                  <div className="relative" ref={dropdownRef}>
                    <button
                      type="button"
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      disabled={isLoading}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 flex items-center justify-between hover:bg-slate-50 transition focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600"
                    >
                      {selectedAdmin ? (
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Photo de profil ronde avec bordure fine bleu ciel */}
                          <div className="relative w-10 h-10 rounded-full overflow-hidden bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 font-bold text-xs shrink-0">
                            {selectedAdmin.photoURL ? (
                              <img
                                src={selectedAdmin.photoURL}
                                alt={selectedAdmin.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span>
                                {(selectedAdmin.name || "A")
                                  .substring(0, 2)
                                  .toUpperCase()}
                              </span>
                            )}
                          </div>
                          {/* Nom en gras + Rôle / Responsabilité en sous-titre */}
                          <div className="text-left min-w-0">
                            <p className="text-sm font-bold text-slate-900 truncate">
                              {selectedAdmin.name}
                            </p>
                            <p className="text-xs text-slate-400 truncate">
                              {selectedAdmin.mail}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">
                          Sélectionnez un compte
                        </span>
                      )}
                      <ChevronDown
                        className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ml-2 ${
                          isDropdownOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {/* Liste déroulante des Administrateurs */}
                    {isDropdownOpen && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-xl py-2 z-50 max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
                        {admins.map((admin) => (
                          <button
                            key={admin.idUser}
                            type="button"
                            onClick={() => {
                              setSelectedAdminId(admin.idUser);
                              setIsDropdownOpen(false);
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition text-left ${
                              admin.idUser === selectedAdminId
                                ? "bg-blue-50/50"
                                : ""
                            }`}
                          >
                            <div className="relative w-9 h-9 rounded-full overflow-hidden bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 font-bold text-xs shrink-0">
                              {admin.photoURL ? (
                                <img
                                  src={admin.photoURL}
                                  alt={admin.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span>
                                  {(admin.name || "A")
                                    .substring(0, 2)
                                    .toUpperCase()}
                                </span>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-slate-900 truncate">
                                {admin.name}
                              </p>
                              <p className="text-[11px] text-slate-400 truncate">
                                {admin.mail}
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
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mot de passe
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={handlePasswordChange}
                    placeholder=".........."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 transition"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>

                <div className="flex justify-end mt-2">
                  <button
                    type="button"
                    className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline transition"
                  >
                    Mot de passe oublié ?
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || loadingAdmins}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Vérification</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>Se Connecter</span>
                  </>
                )}
              </button>

              {/* Bouton de demande de création de compte */}
              <button
                type="button"
                onClick={handleGoToRequestAdmin}
                className="group w-full flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-3 text-sm font-semibold text-blue-600 hover:bg-blue-600 hover:border-blue-600 hover:text-white hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-200 active:scale-95"
              >
                <UserPlus className="w-4 h-4 text-blue-600 group-hover:text-white transition-colors duration-200" />
                <span>Demande de création de compte Admin</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
