import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { MenuGroupModel, MenuModel } from '../models/menu.model';
import { IngredientModel } from '../models/ingredient.model';
import { FirestoreService } from './firestore.service';
import { RecipeService } from './recipe.service';

/**
 * Interface pour un élément de la liste de courses
 */
export interface ShoppingItem {
  name: string;
  quantity: number;
  unit: string;
}

// Interface pour le document Firestore
interface MenuGroupDocument {
  id: string;
  data: MenuGroupModel;
}

@Injectable({
  providedIn: 'root',
})
export class MenuService {
  private static readonly COLLECTION_NAME = 'menus';

  // Cache des groupes de menus
  private cache: MenuGroupModel[] = [];
  private isLoaded = false;

  constructor(private firestoreService: FirestoreService, private recipeService: RecipeService) {}

  /**
   * Indique si les données sont chargées
   */
  get loaded(): boolean {
    return this.isLoaded;
  }

  /**
   * Récupère les groupes de menus depuis le cache
   */
  getMenuGroups(): MenuGroupModel[] {
    return this.cache;
  }

  /**
   * Génère un ID unique
   */
  private generateId(): string {
    const now = new Date();
    return (
      'menu_' +
      now.toISOString().replace(/[:.]/g, '-') +
      '-' +
      Math.random().toString(36).substr(2, 9)
    );
  }

  /**
   * Charge les groupes de menus depuis Firestore dans le cache
   * @returns Observable avec le nombre de groupes chargés
   */
  load(): Observable<number> {
    console.log('[MenuService] Début du chargement des menus...');
    return this.firestoreService
      .getAllDocuments<MenuGroupDocument>(MenuService.COLLECTION_NAME)
      .pipe(
        map((docs) => {
          console.log(`[MenuService] ${docs.length} documents récupérés depuis Firestore`);
          return docs.map((doc) => {
            const menuGroup = doc.data.data;
            return {
              ...menuGroup,
              id: doc.id,
              // Convertir la date string en objet Date si nécessaire
              date: menuGroup.date instanceof Date ? menuGroup.date : new Date(menuGroup.date),
            };
          });
        }),
        tap((menuGroups) => {
          this.cache = menuGroups;
          this.isLoaded = true;
          console.log(`[MenuService] ✅ ${menuGroups.length} groupes de menus chargés en cache`);
        }),
        map((menuGroups) => menuGroups.length),
        catchError((error) => {
          console.error('[MenuService] ❌ Erreur de chargement:', error);
          console.warn('[MenuService] ⚠️ Le cache sera vide (permissions Firestore?)');
          this.cache = [];
          this.isLoaded = true;
          return of(0);
        })
      );
  }

  /**
   * Sauvegarde un groupe de menus dans Firestore
   */
  private saveToFirestore(menuGroup: MenuGroupModel): Observable<void> {
    return this.firestoreService.setDocument(MenuService.COLLECTION_NAME, menuGroup.id, {
      id: menuGroup.id,
      data: menuGroup,
    });
  }

  /**
   * Supprime un groupe de menus de Firestore
   */
  private deleteFromFirestore(id: string): Observable<void> {
    return this.firestoreService.deleteDocument(MenuService.COLLECTION_NAME, id);
  }

  /**
   * Crée un nouveau groupe de menus
   * @param menus Liste des menus à inclure
   * @returns Observable<MenuGroupModel> Le groupe créé
   */
  create(menus: MenuModel[]): Observable<MenuGroupModel> {
    const id = this.generateId();
    const menuGroup: MenuGroupModel = {
      id,
      menus,
      date: new Date(),
      numberOfMeals: menus.length,
    };

    this.cache.push(menuGroup);

    return this.saveToFirestore(menuGroup).pipe(map(() => menuGroup));
  }

  /**
   * Crée un nouveau groupe de menus avec date et nombre de repas
   * @param menus Liste des menus à inclure
   * @param date Date de début du menu
   * @param numberOfMeals Nombre de repas prévus
   * @returns Observable<MenuGroupModel> Le groupe créé
   */
  createWithMeals(
    menus: MenuModel[],
    date: Date,
    numberOfMeals: number
  ): Observable<MenuGroupModel> {
    const id = this.generateId();
    const menuGroup: MenuGroupModel = {
      id,
      menus,
      date,
      numberOfMeals,
    };

    this.cache.push(menuGroup);

    return this.saveToFirestore(menuGroup).pipe(map(() => menuGroup));
  }

  /**
   * Met à jour un groupe de menus existant
   * @param menuGroup Le groupe à mettre à jour
   * @returns Observable<boolean> true si mis à jour, false si non trouvé
   */
  update(menuGroup: MenuGroupModel): Observable<boolean> {
    const index = this.cache.findIndex((m) => m.id === menuGroup.id);
    if (index === -1) {
      return of(false);
    }

    this.cache[index] = menuGroup;
    return this.saveToFirestore(menuGroup).pipe(map(() => true));
  }

  /**
   * Supprime un groupe de menus
   * @param id ID du groupe à supprimer
   * @returns Observable<boolean> true si supprimé
   */
  delete(id: string): Observable<boolean> {
    const index = this.cache.findIndex((m) => m.id === id);
    if (index !== -1) {
      this.cache.splice(index, 1);
      return this.deleteFromFirestore(id).pipe(map(() => true));
    }
    return of(false);
  }

  /**
   * Récupère un groupe de menus par son ID
   * @param id ID du groupe
   * @returns Le groupe ou undefined
   */
  getById(id: string): MenuGroupModel | undefined {
    return this.cache.find((m) => m.id === id);
  }

  /**
   * Met à jour le statut "done" d'un menu dans un groupe
   * @param groupId ID du groupe
   * @param menuNum Numéro du menu
   * @param done Nouveau statut
   * @returns Observable<boolean>
   */
  updateMenuDone(groupId: string, menuNum: number, done: boolean): Observable<boolean> {
    const group = this.cache.find((m) => m.id === groupId);
    if (!group) {
      return of(false);
    }

    const menu = group.menus.find((m) => m.num === menuNum);
    if (!menu) {
      return of(false);
    }

    menu.done = done;
    return this.saveToFirestore(group).pipe(map(() => true));
  }

  /**
   * Génère la liste de courses pour un groupe de menus
   * Additionne les quantités des ingrédients identiques (même nom + même unité)
   * @param menuGroup Le groupe de menus
   * @returns Liste de courses agrégée
   */
  generateShoppingList(menuGroup: MenuGroupModel): ShoppingItem[] {
    const recipes = this.recipeService.getRecipes();
    const itemsMap = new Map<string, ShoppingItem>();

    // Parcourir tous les menus qui ont une recette assignée
    for (const menu of menuGroup.menus) {
      if (!menu.recipeId) continue;

      const recipe = recipes.find((r) => r.id === menu.recipeId);
      if (!recipe) continue;

      // Parcourir tous les ingrédients de la recette
      for (const ingredient of recipe.ingredients) {
        // Clé unique: nom + unité (en minuscules pour éviter les doublons)
        const key = `${ingredient.name.toLowerCase()}|${ingredient.unit.toLowerCase()}`;

        if (itemsMap.has(key)) {
          // Additionner la quantité
          const existing = itemsMap.get(key)!;
          existing.quantity += ingredient.quantity;
        } else {
          // Créer un nouvel élément
          itemsMap.set(key, {
            name: ingredient.name,
            quantity: ingredient.quantity,
            unit: ingredient.unit,
          });
        }
      }
    }

    // Convertir en tableau et trier par nom
    return Array.from(itemsMap.values()).sort((a, b) =>
      a.name.toLowerCase().localeCompare(b.name.toLowerCase())
    );
  }

  /**
   * Réinitialise le cache
   */
  clear(): void {
    this.cache = [];
    this.isLoaded = false;
  }
}
