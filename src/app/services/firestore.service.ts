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
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';

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
   * @returns Observable avec les données du document ou null
   */
  getDocument<T>(collectionName: string, docId: string): Observable<T | null> {
    const docRef = doc(this.db, collectionName, docId);
    return from(getDoc(docRef)).pipe(
      map((docSnap) => {
        if (docSnap.exists()) {
          return docSnap.data() as T;
        }
        return null;
      })
    );
  }

  /**
   * Récupère tous les documents d'une collection
   * @param collectionName Nom de la collection
   * @returns Observable avec tableau des documents avec leurs IDs
   */
  getAllDocuments<T>(collectionName: string): Observable<{ id: string; data: T }[]> {
    return from(getDocs(collection(this.db, collectionName))).pipe(
      map((querySnapshot) => {
        const documents: { id: string; data: T }[] = [];
        querySnapshot.forEach((doc) => {
          documents.push({
            id: doc.id,
            data: doc.data() as T,
          });
        });
        return documents;
      })
    );
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
   * @returns Observable<void>
   */
  setDocument<T extends DocumentData>(
    collectionName: string,
    docId: string,
    data: T
  ): Observable<void> {
    const docRef = doc(this.db, collectionName, docId);
    return from(setDoc(docRef, this.cleanData(data)));
  }

  /**
   * Met à jour partiellement un document
   * @param collectionName Nom de la collection
   * @param docId ID du document
   * @param data Données partielles à mettre à jour
   * @returns Observable<void>
   */
  updateDocument(
    collectionName: string,
    docId: string,
    data: Partial<DocumentData>
  ): Observable<void> {
    const docRef = doc(this.db, collectionName, docId);
    return from(updateDoc(docRef, data));
  }

  /**
   * Supprime un document
   * @param collectionName Nom de la collection
   * @param docId ID du document
   * @returns Observable<void>
   */
  deleteDocument(collectionName: string, docId: string): Observable<void> {
    const docRef = doc(this.db, collectionName, docId);
    return from(deleteDoc(docRef));
  }
}
