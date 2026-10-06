"use client";

import { useState, useEffect, ReactElement } from "react";
import { Wifi, WifiOff } from "lucide-react";

export default function NetworkStatus(): ReactElement {
  const [isOnline, setIsOnline] = useState<boolean>(true);

  useEffect(() => {
    // 1. Initialiser avec le statut actuel du navigateur
    setIsOnline(navigator.onLine);

    // 2. Écouter les événements de connexion/déconnexion du navigateur
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
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
