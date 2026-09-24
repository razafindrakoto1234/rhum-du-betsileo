"use client";
import { loginAdmin } from "@/lib/service/authService";
import { onAuthStateChanged } from "firebase/auth";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";

// Typer les items de la liste de fonctionnalités pour garder le code propre
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
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const router: AppRouterInstance = useRouter();

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setPassword(e.target.value);
  };

  const togglePasswordVisibility = (): void => {
    setShowPassword((prev: boolean) => !prev);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await loginAdmin(email, password);
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
                src="/logo.jpg"
                alt="Natur'eau"
                width={96}
                height={96}
                className="object-contain"
                priority
              />

              <Image
                src="/widistri.jpg"
                alt="Natur'eau"
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
                  Adresse E-mail
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={handleEmailChange}
                  placeholder="admin@gmail.com"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
                />
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
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Vérification</span>
                  </>
                ) : (
                  <span>Se Connecter</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
