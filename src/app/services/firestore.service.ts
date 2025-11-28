import { Injectable } from '@angular/core';
import { initializeApp, FirebaseApp } from 'firebase/app';
import {
  getFirestore,
  Firestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  DocumentData,
} from 'firebase/firestore';

/**
 * Service générique pour les opérations Firestore
 */
@Injectable({
  providedIn: 'root',
})
export class FirestoreService {
  // Configuration Firebase
  private static readonly FIREBASE_CONFIG = {
    apiKey: 'AIzaSyAAcSmbJ4na9wuI3FI3eaDY9RsJ-r-uqI4',
    authDomain: 'la-cantiniere.firebaseapp.com',
    projectId: 'la-cantiniere',
    storageBucket: 'la-cantiniere.firebasestorage.app',
    messagingSenderId: '516630490220',
    appId: '1:516630490220:web:6d2a836cc486bd2b00fc49',
  };

  private app: FirebaseApp;
  private db: Firestore;

  constructor() {
    this.app = initializeApp(FirestoreService.FIREBASE_CONFIG);
    this.db = getFirestore(this.app);
  }

  /**
   * Récupère un document par son ID
   * @param collectionName Nom de la collection
   * @param docId ID du document
   * @returns Les données du document ou null
   */
  async getDocument<T>(collectionName: string, docId: string): Promise<T | null> {
    try {
      const docRef = doc(this.db, collectionName, docId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return docSnap.data() as T;
      }
      return null;
    } catch (error) {
      console.error(`Erreur lors de la récupération du document ${docId}:`, error);
      throw error;
    }
  }

  /**
   * Récupère tous les documents d'une collection
   * @param collectionName Nom de la collection
   * @returns Tableau des documents avec leurs IDs
   */
  async getAllDocuments<T>(collectionName: string): Promise<{ id: string; data: T }[]> {
    try {
      const querySnapshot = await getDocs(collection(this.db, collectionName));
      const documents: { id: string; data: T }[] = [];

      querySnapshot.forEach((doc) => {
        documents.push({
          id: doc.id,
          data: doc.data() as T,
        });
      });

      return documents;
    } catch (error) {
      console.error(`Erreur lors de la récupération de la collection ${collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Nettoie les valeurs undefined et null d'un objet (Firestore ne les accepte pas)
   */
  private cleanData<T>(data: T): T {
    return JSON.parse(JSON.stringify(data, (_, value) => (value === null ? undefined : value)));
  }

  /**
   * Crée ou remplace un document
   * @param collectionName Nom de la collection
   * @param docId ID du document
   * @param data Données à sauvegarder
   */
  async setDocument<T extends DocumentData>(
    collectionName: string,
    docId: string,
    data: T
  ): Promise<void> {
    try {
      const docRef = doc(this.db, collectionName, docId);
      await setDoc(docRef, this.cleanData(data));
    } catch (error) {
      console.error(`Erreur lors de la sauvegarde du document ${docId}:`, error);
      throw error;
    }
  }

  /**
   * Met à jour partiellement un document
   * @param collectionName Nom de la collection
   * @param docId ID du document
   * @param data Données partielles à mettre à jour
   */
  async updateDocument(
    collectionName: string,
    docId: string,
    data: Partial<DocumentData>
  ): Promise<void> {
    try {
      const docRef = doc(this.db, collectionName, docId);
      await updateDoc(docRef, data);
    } catch (error) {
      console.error(`Erreur lors de la mise à jour du document ${docId}:`, error);
      throw error;
    }
  }

  /**
   * Supprime un document
   * @param collectionName Nom de la collection
   * @param docId ID du document
   */
  async deleteDocument(collectionName: string, docId: string): Promise<void> {
    try {
      const docRef = doc(this.db, collectionName, docId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error(`Erreur lors de la suppression du document ${docId}:`, error);
      throw error;
    }
  }
}
