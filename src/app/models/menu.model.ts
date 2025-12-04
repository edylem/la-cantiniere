/**
 * Modèle représentant un élément de menu
 */
export interface MenuModel {
  /** Numéro de l'élément dans le menu */
  num: number;
  /** ID de la recette associée */
  recipeId: string;
  /** Indique si l'élément a été réalisé */
  done: boolean;
  /** Nombre de personnes pour ce repas */
  personnes: number;
}

/**
 * Modèle représentant un groupe de menus
 */
export interface MenuGroupModel {
  /** Identifiant unique du groupe */
  id: string;
  /** Liste des menus */
  menus: MenuModel[];
  /** Date de début du menu */
  date: Date;
  /** Nombre de repas prévus */
  numberOfMeals: number;
}
