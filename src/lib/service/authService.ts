import {
  browserSessionPersistence,
  setPersistence,
  signInWithEmailAndPassword,
  signOut,
  UserCredential,
} from "firebase/auth";
import { doc, DocumentSnapshot, getDoc } from "firebase/firestore";
import { UserProfile } from "@/types/auth";
import { auth, db } from "../firebase/firebase";

export const loginAdmin = async (
  email: string,
  password: string,
): Promise<UserProfile> => {
  try {
    // Forcer la session à se détruire à la fermeture du navigateur
    await setPersistence(auth, browserSessionPersistence);

    // Connexion via Firebase Auth
    const userCredential: UserCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password,
    );
    const uid: string = userCredential.user.uid;

    // Récupération du profil Firestore (fonctionne en ligne et hors ligne si mis en cache)
    const userDocRef = doc(db, "users", uid);
    const userDoc: DocumentSnapshot = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      await signOut(auth);
      throw new Error("Aucun profil utilisateur associé à ce compte.");
    }

    const userData = userDoc.data() as UserProfile;

    //Contrôle du rôle
    if (userData.responsability !== "Administrateur") {
      await signOut(auth);
      throw new Error("Accès refusé: Droits d'administrateur requis.");
    }

    if (userData.status !== "APPROVED") {
      await signOut(auth);
      throw new Error("Accès refusé: Votre compte n'est pas encore approuvé.");
    }

    return userData;
  } catch (error: any) {
    // Gestion spécifique du hors ligne si le compte n'a jamais été authentifié sur l'appareil
    if (
      error.code === "auth/network-request-failed" ||
      (!navigator.onLine &&
        !error.message.includes("Accès refusé") &&
        !error.message.includes("approuvé"))
    ) {
      throw new Error(
        "Vous êtes hors ligne. Une connexion est requise pour la première connexion de cet administrateur.",
      );
    }

    if (error.code === "auth/invalid-credential") {
      throw new Error(
        "Identifiants incorrects (Adresse e-mail ou mot de passe).",
      );
    }

    // Propager les erreurs personnalisées (ex: Droits d'administrateur requis)
    throw new Error(
      error.message || "Une erreur s'est produite lors de la connexion.",
    );
  }
};
