// Lecture Hybride en temps réel (Collections)

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  DocumentData,
  onSnapshot,
  query,
  QueryConstraint,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase/firebase";

// Bascule automatiquement entre les serveurs Firebase et IndexDB
export const subscribeToCollection = <T>(
  collectionName: string,
  callback: (items: T[]) => void,
  constraints: QueryConstraint[] = [],
) => {
  const q = query(collection(db, collectionName), ...constraints);

  return onSnapshot(
    q,
    (snapshot) => {
      const items = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as T[];
      callback(items);
    },
    (error) => {
      console.error(
        `Erreur d'écoute sur la collection ${collectionName}:`,
        error,
      );
    },
  );
};

// Lecture Hybride d'un document unique
export const subscribeToDocument = <T>(
  collectionName: string,
  docId: string,
  callback: (item: T | null) => void,
) => {
  const docRef = doc(db, collectionName, docId);

  return onSnapshot(
    docRef,
    (docSnap) => {
      if (docSnap.exists()) {
        callback({ id: docSnap.id, ...docSnap.data() } as T);
      } else {
        callback(null);
      }
    },
    (error) => {
      console.error(`Erreur d'écoute du document ${docId}:`, error);
    },
  );
};

// Ajout Hybride (Sauvegarde locale immédiate -> Synchro réseau dès que connecté)
export const addDocument = async <T extends DocumentData>(
  collectionName: string,
  data: T,
): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, collectionName), {
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    return docRef.id;
  } catch (error) {
    console.error(`Erreur d'ajout dans ${collectionName} :`, error);
    throw error;
  }
};

// Modification Hybride
export const updateDocument = async <T extends DocumentData>(
  collectionName: string,
  docId: string,
  data: Partial<T>,
): Promise<void> => {
  try {
    const docRef = doc(db, collectionName, docId);
    await updateDoc(docRef, {
      ...data,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error(`Erreur de mise à jour du document ${docId}:`, error);
    throw error;
  }
};

// Suppression Hybride
export const deleteDocument = async (
  collectionName: string,
  docId: string,
): Promise<void> => {
  try {
    const docRef = doc(db, collectionName, docId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error(`Erreur de suppression du document ${docId}:`, error);
    throw error;
  }
};
