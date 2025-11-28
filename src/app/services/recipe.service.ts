import { Injectable, signal } from '@angular/core';
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

  private recipes: RecipeModel[] = [];
  private initialized = false;

  // Signal pour notifier les changements (Angular zoneless friendly)
  private recipesSignal = signal<RecipeModel[]>([]);

  constructor(private firestoreService: FirestoreService) {
    // Chargement automatique au démarrage
    this.loadFromFirestore();
  }

  /**
   * Récupère les recettes actuelles
   */
  getRecipes(): RecipeModel[] {
    return this.recipes;
  }

  /**
   * Génère un ID unique
   */
  private generateId(): string {
    const now = new Date();
    return now.toISOString().replace(/[:.]/g, '-') + '-' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Charge les recettes depuis Firestore
   * @returns Promise avec le nombre de recettes chargées
   */
  async loadFromFirestore(): Promise<number> {
    try {
      const docs = await this.firestoreService.getAllDocuments<RecipeDocument>(
        RecipeService.COLLECTION_NAME
      );

      this.recipes = docs.map((doc) => {
        const recipe = doc.data.data;
        return {
          ...recipe,
          id: doc.id, // Utiliser l'ID du document Firestore
          season: Array.isArray(recipe.season) ? recipe.season : [recipe.season],
        };
      });

      this.recipesSignal.set(this.recipes);
      return this.recipes.length;
    } catch (error) {
      console.error('Erreur lors du chargement depuis Firestore:', error);
      throw error;
    }
  }

  /**
   * Sauvegarde toutes les recettes dans Firestore (crée/met à jour chaque document)
   */
  async saveToFirestore(): Promise<void> {
    try {
      for (const recipe of this.recipes) {
        await this.firestoreService.setDocument(RecipeService.COLLECTION_NAME, recipe.id, {
          id: recipe.id,
          data: recipe,
        });
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde vers Firestore:', error);
      throw error;
    }
  }

  /**
   * Sauvegarde une recette individuelle dans Firestore
   */
  private async saveRecipeToFirestore(recipe: RecipeModel): Promise<void> {
    await this.firestoreService.setDocument(RecipeService.COLLECTION_NAME, recipe.id, {
      id: recipe.id,
      data: recipe,
    });
  }

  /**
   * Supprime une recette de Firestore
   */
  private async deleteRecipeFromFirestore(id: string): Promise<void> {
    await this.firestoreService.deleteDocument(RecipeService.COLLECTION_NAME, id);
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

      this.recipes = validRecipes as RecipeModel[];
      this.recipesSignal.set(this.recipes);
      return validRecipes.length;
    } catch (err) {
      throw err;
    }
  }

  /**
   * Signal readonly pour les composants
   */
  get recipes$() {
    return this.recipesSignal.asReadonly();
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

          this.recipes = validRecipes as RecipeModel[];
          this.recipesSignal.set(this.recipes);

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
    const jsonString = JSON.stringify(this.recipes, null, 2);

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
   * Ajouter une recette
   */
  addRecipe(recipe: RecipeModel): void {
    this.recipes.push(recipe);
    this.recipesSignal.set([...this.recipes]);
  }

  /**
   * Supprimer une recette par ID
   * Sauvegarde automatiquement vers Firestore
   */
  async deleteRecipe(id: string): Promise<boolean> {
    const index = this.recipes.findIndex((r) => r.id === id);
    if (index !== -1) {
      this.recipes.splice(index, 1);
      this.recipesSignal.set([...this.recipes]);
      await this.deleteRecipeFromFirestore(id);
      return true;
    }
    return false;
  }

  /**
   * Mettre à jour une recette
   */
  updateRecipe(id: string, updatedRecipe: RecipeModel): boolean {
    const index = this.recipes.findIndex((r) => r.id === id);
    if (index !== -1) {
      this.recipes[index] = updatedRecipe;
      this.recipesSignal.set([...this.recipes]);
      return true;
    }
    return false;
  }

  /**
   * Sauvegarder une recette (création ou mise à jour)
   * Si l'ID existe déjà, met à jour la recette, sinon l'ajoute avec un ID généré
   * Sauvegarde automatiquement vers Firestore
   * @param recipe La recette à sauvegarder
   * @returns true si mise à jour, false si création
   */
  async saveRecipe(recipe: RecipeModel): Promise<boolean> {
    let recipeToSave = recipe;

    if (!recipe.id) {
      // Générer un ID unique
      const id = this.generateId();
      recipeToSave = { ...recipe, id };
    }

    const existingIndex = this.recipes.findIndex((r) => r.id === recipeToSave.id);
    let isUpdate: boolean;

    if (existingIndex !== -1) {
      // Mise à jour
      this.recipes[existingIndex] = recipeToSave;
      isUpdate = true;
    } else {
      // Création
      this.recipes.push(recipeToSave);
      isUpdate = false;
    }

    this.recipesSignal.set([...this.recipes]);

    // Sauvegarder vers Firestore (uniquement cette recette)
    await this.saveRecipeToFirestore(recipeToSave);

    return isUpdate;
  }

  /**
   * Réinitialiser toutes les recettes
   */
  clearRecipes(): void {
    this.recipes = [];
    this.recipesSignal.set([]);
  }
}
