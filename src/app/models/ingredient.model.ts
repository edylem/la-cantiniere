/**
 * Modèle minimal Ingredient demandé par la nouvelle conception.
 * Propriétés :
 * - name: nom de l'ingrédient
 * - quantity: quantité (nombre)
 * - unit: unité de mesure (string)
 */
export interface IngredientModel {
  name: string;
  quantity: number;
  unit: string;
}
