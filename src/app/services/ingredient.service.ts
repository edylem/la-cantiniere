import { Injectable } from '@angular/core';
import { RecipeModel } from '../models/recipe.model';

@Injectable({
  providedIn: 'root',
})
export class IngredientService {
  // Cache des ingrédients uniques (noms)
  private ingredientsCache: string[] = [];

  // Cache des unités uniques
  private unitsCache: string[] = [];

  // Indique si le service est chargé
  private isLoaded = false;

  /**
   * Indique si les données sont chargées
   */
  get loaded(): boolean {
    return this.isLoaded;
  }

  /**
   * Récupère la liste des ingrédients disponibles
   */
  getIngredients(): string[] {
    return this.ingredientsCache;
  }

  /**
   * Récupère la liste des unités disponibles
   */
  getUnits(): string[] {
    return this.unitsCache;
  }

  /**
   * Charge les ingrédients et unités à partir de la liste des recettes
   * @param recipes Liste des recettes
   */
  load(recipes: RecipeModel[]): void {
    const ingredientsMap = new Map<string, string>();
    const unitsMap = new Map<string, string>();

    // Parcourir toutes les recettes et leurs ingrédients
    for (const recipe of recipes) {
      if (recipe.ingredients) {
        for (const ingredient of recipe.ingredients) {
          // Ajouter le nom de l'ingrédient
          if (ingredient.name) {
            const name = ingredient.name.trim();
            const nameLower = name.toLowerCase();

            // Si déjà présent, garder celui qui commence par une majuscule
            if (ingredientsMap.has(nameLower)) {
              const existing = ingredientsMap.get(nameLower)!;
              // Remplacer uniquement si le nouveau commence par une majuscule et pas l'ancien
              if (this.startsWithUpperCase(name) && !this.startsWithUpperCase(existing)) {
                ingredientsMap.set(nameLower, name);
              }
            } else {
              ingredientsMap.set(nameLower, name);
            }
          }

          // Ajouter l'unité
          if (ingredient.unit) {
            const unit = ingredient.unit.trim();
            const unitLower = unit.toLowerCase();

            // Si déjà présent, garder celui qui commence par une minuscule
            if (unitsMap.has(unitLower)) {
              const existing = unitsMap.get(unitLower)!;
              // Remplacer uniquement si le nouveau commence par une minuscule et pas l'ancien
              if (this.startsWithLowerCase(unit) && !this.startsWithLowerCase(existing)) {
                unitsMap.set(unitLower, unit);
              }
            } else {
              unitsMap.set(unitLower, unit);
            }
          }
        }
      }
    }

    // Convertir en tableaux triés
    this.ingredientsCache = Array.from(ingredientsMap.values()).sort((a, b) =>
      a.toLowerCase().localeCompare(b.toLowerCase())
    );

    this.unitsCache = Array.from(unitsMap.values()).sort((a, b) =>
      a.toLowerCase().localeCompare(b.toLowerCase())
    );

    this.isLoaded = true;
    console.log(
      `[IngredientService] ✅ ${this.ingredientsCache.length} ingrédients et ${this.unitsCache.length} unités chargés`
    );
  }

  /**
   * Vérifie si une chaîne commence par une majuscule
   */
  private startsWithUpperCase(str: string): boolean {
    return str.length > 0 && str[0] === str[0].toUpperCase() && str[0] !== str[0].toLowerCase();
  }

  /**
   * Vérifie si une chaîne commence par une minuscule
   */
  private startsWithLowerCase(str: string): boolean {
    return str.length > 0 && str[0] === str[0].toLowerCase() && str[0] !== str[0].toUpperCase();
  }

  /**
   * Réinitialise le cache
   */
  clear(): void {
    this.ingredientsCache = [];
    this.unitsCache = [];
    this.isLoaded = false;
  }
}
