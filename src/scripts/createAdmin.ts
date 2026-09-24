import { getApps, initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { readFileSync } from "fs";
import { resolve } from "path";

const serviceAccountPath = resolve("./serviceAccountKey.json");
const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, "utf-8"));

if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount),
  });
}

const auth = getAuth();
const db = getFirestore();

async function createAdmin() {
  const adminData = {
    name: "Administrateur",
    smartphone: "0340000000",
    mail: "admin@gmail.com",
    password: "admin1234",
    responsability: "Administrateur",
  };

  try {
    // Création dans Firebase Authentication
    const userRecord = await auth.createUser({
      email: adminData.mail,
      password: adminData.password,
      displayName: adminData.name,
    });

    // Préparation des données pour Firestore (sans stocker le mot de passe en clair)
    const newUser = {
      idUser: userRecord.uid,
      name: adminData.name,
      smartphone: adminData.smartphone,
      mail: adminData.mail,
      responsability: adminData.responsability,
      createdAt: new Date(),
    };

    // Enregistrement du profil utilisateur dans Firestore
    await db.collection("users").doc(userRecord.uid).set(newUser);

    console.log("Compte Administrateur crée avec succès !");
    console.log("ID Utilisateur :", userRecord.uid);
  } catch (error: any) {
    console.error("Erreur lors de la création de l'admin:", error.message);
  }
}

createAdmin();
