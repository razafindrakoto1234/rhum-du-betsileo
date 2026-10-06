// scripts/clean-users.ts
import { adminAuth, adminDb } from "../lib/firebase/firebaseAdmin";

async function cleanUsers() {
  console.log("🧹 Démarrage du nettoyage des utilisateurs...");

  try {
    // 1. Suppression de tous les utilisateurs de Firebase Auth
    const listUsersResult = await adminAuth.listUsers(1000);
    const uids = listUsersResult.users.map((user) => user.uid);

    if (uids.length > 0) {
      await adminAuth.deleteUsers(uids);
      console.log(
        `✅ ${uids.length} utilisateur(s) supprimé(s) de Firebase Auth.`,
      );
    } else {
      console.log("ℹ️ Aucun utilisateur trouvé dans Firebase Auth.");
    }

    // 2. Vider la collection "users" dans Firestore
    const usersSnapshot = await adminDb.collection("users").get();
    if (!usersSnapshot.empty) {
      const batchUsers = adminDb.batch();
      usersSnapshot.docs.forEach((doc) => batchUsers.delete(doc.ref));
      await batchUsers.commit();
      console.log(
        `✅ Collection 'users' vidée (${usersSnapshot.size} document(s)).`,
      );
    } else {
      console.log("ℹ️ La collection 'users' est déjà vide.");
    }

    // 3. Vider la collection "admin_requests" dans Firestore
    const requestsSnapshot = await adminDb.collection("admin_requests").get();
    if (!requestsSnapshot.empty) {
      const batchRequests = adminDb.batch();
      requestsSnapshot.docs.forEach((doc) => batchRequests.delete(doc.ref));
      await batchRequests.commit();
      console.log(
        `✅ Collection 'admin_requests' vidée (${requestsSnapshot.size} document(s)).`,
      );
    } else {
      console.log("ℹ️ La collection 'admin_requests' est déjà vide.");
    }

    console.log("🎉 Nettoyage terminé avec succès !");
    process.exit(0);
  } catch (error) {
    console.error("❌ Erreur lors du nettoyage :", error);
    process.exit(1);
  }
}

cleanUsers();
