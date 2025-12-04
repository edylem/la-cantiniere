import { Injectable } from '@angular/core';
import { Observable, forkJoin, of } from 'rxjs';
import { map, tap, switchMap } from 'rxjs/operators';
import { RecipeModel } from '../models/recipe.model';
import { FirestoreService } from './firestore.service';

// Interface pour le document Firestore (un document par recette)
interface RecipeDocument {
  id: string;
  data: RecipeModel;
}

@Injectable({
  providedIn: 'root',
})
export class RecipeService {
  // Configuration Firestore
  private static readonly COLLECTION_NAME = 'recipes';

  // Cache des recettes (pas de signal, pas d'observable)
  private cache: RecipeModel[] = [];
  private isLoaded = false;

  constructor(private firestoreService: FirestoreService) {}

  /**
   * Indique si les données sont chargées
   */
  get loaded(): boolean {
    return this.isLoaded;
  }

  /**
   * Récupère les recettes depuis le cache
   */
  getRecipes(): RecipeModel[] {
    return this.cache;
  }

  /**
   * Génère un ID unique
   */
  private generateId(): string {
    const now = new Date();
    return now.toISOString().replace(/[:.]/g, '-') + '-' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Charge les recettes depuis Firestore dans le cache
   * @returns Observable avec le nombre de recettes chargées
   */
  load(): Observable<number> {
    console.log('[RecipeService] Début du chargement des recettes...');
    return this.firestoreService
      .getAllDocuments<RecipeDocument>(RecipeService.COLLECTION_NAME)
      .pipe(
        map((docs) => {
          console.log(`[RecipeService] ${docs.length} documents récupérés depuis Firestore`);
          return docs.map((doc) => {
            const recipe = doc.data.data;
            return {
              ...recipe,
              id: doc.id,
              season: Array.isArray(recipe.season)
                ? recipe.season
                : recipe.season
                ? [recipe.season]
                : undefined,
            };
          });
        }),
        tap((recipes) => {
          this.cache = recipes;
          this.isLoaded = true;
          console.log(`[RecipeService] ✅ ${recipes.length} recettes chargées en cache`);
        }),
        map((recipes) => recipes.length)
      );
  }

  /**
   * Sauvegarde une recette individuelle dans Firestore
   */
  private saveRecipeToFirestore(recipe: RecipeModel): Observable<void> {
    return this.firestoreService.setDocument(RecipeService.COLLECTION_NAME, recipe.id, {
      id: recipe.id,
      data: recipe,
    });
  }

  /**
   * Supprime une recette de Firestore
   */
  private deleteRecipeFromFirestore(id: string): Observable<void> {
    return this.firestoreService.deleteDocument(RecipeService.COLLECTION_NAME, id);
  }

  /**
   * Charger des recettes depuis une URL (par exemple un fichier dans assets)
   * @returns Promise qui résout avec le nombre de recettes chargées
   */
  async loadFromUrl(url: string): Promise<number> {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      if (!Array.isArray(data)) {
        throw new Error('Le fichier JSON doit contenir un tableau de recettes');
      }

      const validRecipes = data
        .filter(
          (item: any) =>
            item &&
            typeof item.id === 'string' &&
            typeof item.title === 'string' &&
            Array.isArray(item.ingredients)
        )
        .map((item: any) => ({
          ...item,
          season: Array.isArray(item.season) ? item.season : [item.season], // Normalize season to array
        }));

      this.cache = validRecipes as RecipeModel[];
      return validRecipes.length;
    } catch (err) {
      throw err;
    }
  }

  /**
   * Ouvre un sélecteur de fichier pour charger un fichier JSON contenant un tableau de RecipeModel
   * @returns Promise qui résout avec le nombre de recettes chargées
   */
  async loadData(): Promise<number> {
    return new Promise((resolve, reject) => {
      // Créer un input file invisible
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json,application/json';

      input.onchange = async (event: Event) => {
        const target = event.target as HTMLInputElement;
        const file = target.files?.[0];

        if (!file) {
          reject(new Error('Aucun fichier sélectionné'));
          return;
        }

        try {
          const text = await file.text();
          const data = JSON.parse(text);

          // Vérifier que c'est un tableau
          if (!Array.isArray(data)) {
            reject(new Error('Le fichier JSON doit contenir un tableau de recettes'));
            return;
          }

          // Valider basiquement la structure (optionnel mais recommandé)
          const validRecipes = data
            .filter(
              (item: any) =>
                item &&
                typeof item.id === 'string' &&
                typeof item.title === 'string' &&
                Array.isArray(item.ingredients)
            )
            .map((item: any) => ({
              ...item,
              season: Array.isArray(item.season) ? item.season : [item.season], // Normalize season to array
            }));

          this.cache = validRecipes as RecipeModel[];

          resolve(validRecipes.length);
        } catch (error) {
          reject(new Error(`Erreur lors de la lecture du fichier: ${error}`));
        }
      };

      input.onerror = () => {
        reject(new Error('Erreur lors de la sélection du fichier'));
      };

      // Déclencher le sélecteur
      input.click();
    });
  }

  /**
   * Télécharge les recettes actuelles dans un fichier JSON
   * @param filename Nom du fichier à télécharger (par défaut: recipes.json)
   */
  downloadData(filename: string = 'recipes.json'): void {
    // Convertir les recettes en JSON formaté
    const jsonString = JSON.stringify(this.cache, null, 2);

    // Créer un Blob
    const blob = new Blob([jsonString], { type: 'application/json' });

    // Créer un lien de téléchargement
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;

    // Déclencher le téléchargement
    document.body.appendChild(link);
    link.click();

    // Nettoyer
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Importe des recettes depuis un fichier JSON
   * Supprime toutes les recettes existantes et les remplace par les nouvelles
   * Utilise les IDs présents dans le fichier
   * @returns Observable<number> Le nombre de recettes importées
   */
  importRecipes(): Observable<number> {
    return new Observable((subscriber) => {
      // Créer un input file invisible
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json,application/json';

      input.onchange = async (event: Event) => {
        const target = event.target as HTMLInputElement;
        const file = target.files?.[0];

        if (!file) {
          subscriber.error(new Error('Aucun fichier sélectionné'));
          return;
        }

        try {
          const text = await file.text();
          const data = JSON.parse(text);

          // Vérifier que c'est un tableau
          if (!Array.isArray(data)) {
            subscriber.error(new Error('Le fichier JSON doit contenir un tableau de recettes'));
            return;
          }

          // Valider et normaliser les recettes (générer un ID si absent)
          const validRecipes = data
            .filter(
              (item: any) =>
                item && typeof item.title === 'string' && Array.isArray(item.ingredients)
            )
            .map((item: any) => ({
              ...item,
              id: item.id && typeof item.id === 'string' ? item.id : this.generateId(),
              season: Array.isArray(item.season)
                ? item.season
                : item.season
                ? [item.season]
                : undefined,
            })) as RecipeModel[];

          if (validRecipes.length === 0) {
            subscriber.error(new Error('Aucune recette valide trouvée dans le fichier'));
            return;
          }

          // 1. Supprimer toutes les recettes existantes de Firestore
          const deleteObservables = this.cache.map((recipe) =>
            this.deleteRecipeFromFirestore(recipe.id)
          );

          const deleteAll$ = deleteObservables.length > 0 ? forkJoin(deleteObservables) : of([]);

          // 2. Après suppression, sauvegarder les nouvelles recettes
          deleteAll$
            .pipe(
              switchMap(() => {
                // Vider le cache
                this.cache = [];

                // Sauvegarder toutes les nouvelles recettes
                const saveObservables = validRecipes.map((recipe) =>
                  this.saveRecipeToFirestore(recipe)
                );

                return saveObservables.length > 0 ? forkJoin(saveObservables) : of([]);
              })
            )
            .subscribe({
              next: () => {
                // Mettre à jour le cache avec les nouvelles recettes
                this.cache = validRecipes;
                subscriber.next(validRecipes.length);
                subscriber.complete();
              },
              error: (err) => {
                subscriber.error(err);
              },
            });
        } catch (error) {
          subscriber.error(new Error(`Erreur lors de la lecture du fichier: ${error}`));
        }
      };

      input.onerror = () => {
        subscriber.error(new Error('Erreur lors de la sélection du fichier'));
      };

      // Déclencher le sélecteur
      input.click();
    });
  }

  /**
   * Ajouter une recette au cache
   */
  addRecipe(recipe: RecipeModel): void {
    this.cache.push(recipe);
  }

  /**
   * Supprimer une recette par ID
   * Met à jour le cache et Firestore
   * @returns Observable<boolean>
   */
  deleteRecipe(id: string): Observable<boolean> {
    const index = this.cache.findIndex((r) => r.id === id);
    if (index !== -1) {
      this.cache.splice(index, 1);
      return this.deleteRecipeFromFirestore(id).pipe(map(() => true));
    }
    return new Observable((subscriber) => {
      subscriber.next(false);
      subscriber.complete();
    });
  }

  /**
   * Mettre à jour une recette dans le cache
   */
  updateRecipe(id: string, updatedRecipe: RecipeModel): boolean {
    const index = this.cache.findIndex((r) => r.id === id);
    if (index !== -1) {
      this.cache[index] = updatedRecipe;
      return true;
    }
    return false;
  }

  /**
   * Sauvegarder une recette (création ou mise à jour)
   * Met à jour le cache et Firestore
   * @param recipe La recette à sauvegarder
   * @returns Observable<boolean> true si mise à jour, false si création
   */
  saveRecipe(recipe: RecipeModel): Observable<boolean> {
    let recipeToSave = recipe;

    if (!recipe.id) {
      // Générer un ID unique
      const id = this.generateId();
      recipeToSave = { ...recipe, id };
    }

    const existingIndex = this.cache.findIndex((r) => r.id === recipeToSave.id);
    let isUpdate: boolean;

    if (existingIndex !== -1) {
      // Mise à jour dans le cache
      this.cache[existingIndex] = recipeToSave;
      isUpdate = true;
    } else {
      // Création dans le cache
      this.cache.push(recipeToSave);
      isUpdate = false;
    }

    // Sauvegarder vers Firestore
    return this.saveRecipeToFirestore(recipeToSave).pipe(map(() => isUpdate));
  }

  /**
   * Réinitialiser le cache
   */
  clearRecipes(): void {
    this.cache = [];
  }
}
