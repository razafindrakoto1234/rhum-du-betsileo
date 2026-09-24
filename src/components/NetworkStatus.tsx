"use client";

import { useState, useEffect, ReactElement } from "react";
import { Wifi, WifiOff } from "lucide-react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";

export default function NetworkStatus(): ReactElement {
  const [isOnline, setIsOnline] = useState<boolean>(true);

  useEffect(() => {
    // 1. Écouter les évènements réseau du navigateur
    const updateBrowserStatus = () => {
      setIsOnline(navigator.onLine);
    };

    window.addEventListener("online", updateBrowserStatus);
    window.addEventListener("offline", updateBrowserStatus);

    // 2. Écouter l'état réel de la connexion Firestore
    // On écoute un document factice ou n'importe quelle référence pour vérifier le statut du cache
    const unsubscribeFirestore = onSnapshot(
      doc(db, "--network-check--", "--ping--"),
      { includeMetadataChanges: true },
      (snapshot) => {
        // Si les données proviennent du cache et que la synchro est en attente, nous sommes hors ligne
        if (snapshot.metadata.fromCache) {
          setIsOnline(false);
        } else {
          setIsOnline(true);
        }
      },
      () => {
        // En cas d'erreur de connexion Firestore
        setIsOnline(false);
      },
    );

    return () => {
      window.removeEventListener("online", updateBrowserStatus);
      window.removeEventListener("offline", updateBrowserStatus);
      unsubscribeFirestore();
    };
  }, []);

  if (isOnline) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200 text-xs font-semibold">
        <Wifi className="w-3.5 h-3.5" />
        <span>En ligne (Synchro active)</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 text-amber-800 rounded-full border border-amber-200 text-xs font-semibold animate-pulse">
      <WifiOff className="w-3.5 h-3.5" />
      <span>Hors ligne (Mode Base de Données Locale)</span>
    </div>
  );
}
