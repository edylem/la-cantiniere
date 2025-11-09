import { IngredientModel } from './ingredient.model';

// Saisons (libellés FR) - source de vérité pour selects
export const ALL_SEASONS = ['Printemps', 'Été', 'Automne', 'Hiver'] as const;
export type Season = (typeof ALL_SEASONS)[number];

/**
 * RecipeModel
 * - ingredients: liste d'IngredientModel
 * - description: texte descriptif
 * - season: une des valeurs de Season
 */
export interface RecipeModel {
  // Identifiants et métadonnées (obligatoires)
  id: string;
  title: string;
  /** URL de l'image (optionnelle) */
  image?: string;

  // Contenu de la recette
  ingredients: IngredientModel[];
  description: string;
  season: Season;
  /** Temps de préparation en minutes */
  prepTime?: number;
  /** Coût estimé en euros (nombre) */
  cost: number;
}

export default RecipeModel;
