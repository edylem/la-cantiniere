import { IngredientModel } from './ingredient.model';

// Saisons (libellés FR) - source de vérité pour selects
export const ALL_SEASONS = ['Printemps', 'Été', 'Automne', 'Hiver'] as const;
export type Season = (typeof ALL_SEASONS)[number];

// Catégories de recettes
export const ALL_CATEGORIES = [
  'Apéro',
  'Gâteau',
  'Pour Emilie',
  'Que pour les parents',
  'Quotidien',
  'Réception',
  'Recette rapide',
  'Repas Gourmand',
] as const;
export type Category = (typeof ALL_CATEGORIES)[number];

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
  /** Image en base64 ou URL (optionnelle) */
  image?: string;

  // Contenu de la recette
  ingredients: IngredientModel[];
  description: string;
  /** Saisons (optionnel) */
  season?: Season[];
  /** Catégories (optionnel) */
  category?: Category[];
  /** Nombre de personnes (optionnel) */
  personnes?: number;
  /** Temps de préparation en minutes (optionnel) */
  prepTime?: number;
  /** Coût estimé en euros (optionnel) */
  cost?: number;
}

export default RecipeModel;
