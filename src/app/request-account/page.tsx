"use client";

import { ArrowLeft, CheckCircle2, Eye, EyeOff, Loader2, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { requestAdminService } from "@/lib/service/user/request-admin-service";

export default function RequestAccountPage() {
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [smartphone, setSmartphone] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");

  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const passwordsMatch = confirmPassword === "" || password === confirmPassword;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }

    // --- Formatage automatique du numéro de téléphone ---
    let formattedPhone = smartphone.trim().replace(/\s+/g, "");
    if (formattedPhone !== "") {
      if (formattedPhone.startsWith("0")) {
        formattedPhone = "+261" + formattedPhone.substring(1);
      } else if (!formattedPhone.startsWith("+")) {
        formattedPhone = "+" + formattedPhone;
      }
    }

    setLoading(true);

    try {
      await requestAdminService({
        name,
        mail: email,
        smartphone: formattedPhone, // On passe le numéro formaté au service
        password,
      });

      setSuccess(true);
    } catch (err: any) {
      console.error("Erreur soumission demande admin :", err);
      setError(
        err.message ||
          "Une erreur est survenue lors de l'envoi de votre demande.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-white flex font-sans text-slate-800">
      {/* SECTION GAUCHE : FORMULAIRE */}
      <div className="w-full lg:w-1/2 h-full flex flex-col items-center justify-center p-6 lg:p-12 overflow-y-auto">
        <div className="max-w-sm w-full space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Demande de compte Admin
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Remplissez les informations ci-dessous pour faire votre demande
            </p>
          </div>

          {success ? (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-5 rounded-2xl flex flex-col items-center text-center space-y-3">
              <CheckCircle2 className="w-10 h-10 text-emerald-500" />
              <h3 className="font-bold text-sm">
                Demande envoyée avec succès !
              </h3>
              <p className="text-xs text-emerald-600 leading-relaxed">
                Votre demande de compte administrateur a été transmise à la
                direction. Vous recevrez l'accès dès la validation.
              </p>
              <Link
                href="/login"
                className="mt-2 inline-flex items-center gap-1.5 text-xs text-blue-600 font-semibold hover:underline"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Se connecter
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-rose-50 border border-rose-200 text-rose-600 px-4 py-3 rounded-xl text-xs font-medium">
                  {error}
                </div>
              )}

              <div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Votre nom complet"
                  className="w-full px-4 py-2.5 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border-0 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition"
                />
              </div>

              <div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Adresse e-mail"
                  className="w-full px-4 py-2.5 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border-0 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition"
                />
              </div>

              <div>
                <input
                  type="tel"
                  value={smartphone}
                  onChange={(e) => setSmartphone(e.target.value)}
                  placeholder="Téléphone (ex: 034 16 475 84)"
                  className="w-full px-4 py-2.5 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border-0 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition"
                />
              </div>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mot de passe"
                  className="w-full px-4 py-2.5 pr-10 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border-0 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                >
                  {showPassword ? (
                    <EyeOff className="w-3.5 h-3.5" />
                  ) : (
                    <Eye className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>

              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirmer le mot de passe"
                  className={`w-full px-4 py-2.5 pr-10 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border-0 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 transition ${
                    !passwordsMatch ? "ring-2 ring-rose-500/30" : ""
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-3.5 h-3.5" />
                  ) : (
                    <Eye className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-xs font-bold transition shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Envoyer la demande"
                  )}
                </button>
              </div>
            </form>
          )}

          <div className="text-center text-xs text-slate-400 pt-1">
            Vous avez déjà un compte ?{" "}
            <Link
              href="/login"
              className="text-blue-600 font-semibold hover:underline"
            >
              Se connecter
            </Link>
          </div>
        </div>
      </div>

      {/* SECTION DROITE : BANNIÈRE */}
      <div className="hidden lg:flex lg:w-1/2 h-full p-8 lg:p-10 items-center justify-center relative overflow-hidden bg-slate-50">
        <div className="relative w-full h-full rounded-3xl overflow-hidden shadow-lg border border-slate-200/60">
          <Image
            src="/Karepoka.jpg"
            alt="Rhum du Betsileo Cover"
            fill
            priority
            className="object-cover"
          />

          <Link
            href="/login"
            className="absolute top-4 right-4 w-8 h-8 bg-black/20 hover:bg-black/40 backdrop-blur-md text-white rounded-full flex items-center justify-center transition z-10"
            title="Fermer"
          >
            <X className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
