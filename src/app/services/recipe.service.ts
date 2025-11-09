import { Injectable, signal } from '@angular/core';
import { RecipeModel } from '../models/recipe.model';

@Injectable({
  providedIn: 'root',
})
export class RecipeService {
  private recipes: RecipeModel[] = [];

  // Signal pour notifier les changements (Angular zoneless friendly)
  private recipesSignal = signal<RecipeModel[]>([]);

  constructor() {}

  /**
   * Récupère les recettes actuelles
   */
  getRecipes(): RecipeModel[] {
    return this.recipes;
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
   */
  deleteRecipe(id: string): boolean {
    const index = this.recipes.findIndex((r) => r.id === id);
    if (index !== -1) {
      this.recipes.splice(index, 1);
      this.recipesSignal.set([...this.recipes]);
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
   * @param recipe La recette à sauvegarder
   * @returns true si mise à jour, false si création
   */
  saveRecipe(recipe: RecipeModel): boolean {
    let recipeToSave = recipe;

    if (!recipe.id) {
      // Générer un ID basé sur la date et l'heure
      const now = new Date();
      const id = now.toISOString().replace(/[:.]/g, '-');
      recipeToSave = { ...recipe, id };
    }

    const existingIndex = this.recipes.findIndex((r) => r.id === recipeToSave.id);

    if (existingIndex !== -1) {
      // Mise à jour
      this.recipes[existingIndex] = recipeToSave;
      this.recipesSignal.set([...this.recipes]);
      return true;
    } else {
      // Création
      this.recipes.push(recipeToSave);
      this.recipesSignal.set([...this.recipes]);
      return false;
    }
  }

  /**
   * Réinitialiser toutes les recettes
   */
  clearRecipes(): void {
    this.recipes = [];
    this.recipesSignal.set([]);
  }
}
