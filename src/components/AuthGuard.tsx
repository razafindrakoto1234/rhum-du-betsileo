"use client";

import { auth, db } from "@/lib/firebase/firebase";
import { UserProfile } from "@/types/auth";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { ReactElement, ReactNode, useEffect, useState } from "react";

interface AuthGuardProps {
  readonly children: ReactNode;
}
export default function AuthGuard({ children }: AuthGuardProps): ReactElement {
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    if (isAuthorized) {
      // Bloque l'historique en réinjectant l'URL actuelle
      window.history.pushState(null, "", window.location.href);

      const handlePopState = () => {
        window.history.pushState(null, "", window.location.href);
      };

      window.addEventListener("popstate", handlePopState);

      return () => {
        window.removeEventListener("popstate", handlePopState);
      };
    }
  }, [isAuthorized]);

  useEffect(() => {
    // Ecouter en temps réel de l'état Firebase Auth
    const unsubscribe = onAuthStateChanged(
      auth,
      async (user: FirebaseUser | null) => {
        if (!user) {
          setIsAuthorized(false);
          setIsLoading(false);
          router.replace("/login");
          return;
        }

        try {
          // Vérification du rôle Administrateur dans Firestore
          const userDocRef = doc(db, "users", user.uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            const userData = userDoc.data() as UserProfile;

            if (userData.responsability === "Administrateur") {
              setIsAuthorized(true);
            } else {
              // Utilisateur connecté mais PAS administrateur
              setIsAuthorized(false);
              router.replace("/login");
            }
          } else {
            setIsAuthorized(false);
            router.replace("/login");
          }
        } catch (error: unknown) {
          console.error("Erreur de vérification des droits :", error);
          setIsAuthorized(false);
          router.replace("/login");
        } finally {
          setIsLoading(false);
        }
      },
    );
    return () => unsubscribe();
  }, [router]);

  // Affichage d'un écran de chargement pendant la vérification des droits
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-600 font-medium text-sm">
          <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
          Vérification des droits d'accès...
        </div>
      </div>
    );
  }

  // Si l'utilisateur n'est pas autorisé, on affiche rien (la redirection a lieu)
  if (!isAuthorized) {
    return <></>;
  }

  // Si autorisé, on affiche la page demandée
  return <>{children}</>;
}
