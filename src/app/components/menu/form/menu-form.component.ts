import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnInit,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { DatePickerModule } from 'primeng/datepicker';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { ConfirmationService } from 'primeng/api';
import { MenuGroupModel, MenuModel } from '../../../models/menu.model';
import { RecipeModel } from '../../../models/recipe.model';
import { RecipeService } from '../../../services/recipe.service';
import { MenuService } from '../../../services/menu.service';
import { RecipeFormComponent } from '../../recipe/form/recipe-form.component';
import { ShoppingListComponent } from '../../shopping-list/shopping-list.component';

@Component({
  selector: 'app-menu-form',
  standalone: true,
  providers: [ConfirmationService],
  imports: [
    CommonModule,
    FormsModule,
    DialogModule,
    ButtonModule,
    CheckboxModule,
    DatePickerModule,
    InputNumberModule,
    RecipeFormComponent,
    ConfirmDialogModule,
    ShoppingListComponent,
  ],
  templateUrl: './menu-form.component.html',
  styleUrls: ['./menu-form.component.scss'],
})
export class MenuFormComponent implements OnInit, OnChanges {
  @Input() visible = false;
  @Input() menuGroup!: MenuGroupModel;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() saved = new EventEmitter<MenuGroupModel>();

  // Copie locale pour l'édition
  editedMenuGroup!: MenuGroupModel;
  recipes: RecipeModel[] = [];

  // Pour afficher une recette
  showRecipeDialog = false;
  selectedRecipe?: RecipeModel;

  // Pour la liste de courses
  showShoppingDialog = false;

  constructor(
    private recipeService: RecipeService,
    private menuService: MenuService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.recipes = this.recipeService.getRecipes();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Quand visible passe à true, créer la copie pour l'édition
    if (changes['visible'] && this.visible && this.menuGroup) {
      this.initEditedMenuGroup();
    }
  }

  initEditedMenuGroup(): void {
    if (!this.menuGroup) return;
    this.editedMenuGroup = {
      ...this.menuGroup,
      date: new Date(this.menuGroup.date),
      menus: this.menuGroup.menus.map((m) => ({
        ...m,
        personnes: m.personnes || 4, // Valeur par défaut si non défini
      })),
    };
    console.log('[MenuForm] editedMenuGroup initialisé:', this.editedMenuGroup);
  }

  /**
   * Récupère le titre de la recette
   */
  getRecipeTitle(recipeId: string): string {
    if (!recipeId) return 'Non assigné';
    const recipe = this.recipes.find((r) => r.id === recipeId);
    return recipe?.title || 'Recette inconnue';
  }

  /**
   * Formate la date pour l'affichage dans le header
   */
  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }

  /**
   * Sauvegarde les modifications
   */
  onSave(): void {
    this.menuService.update(this.editedMenuGroup).subscribe({
      next: () => {
        // Mettre à jour le menuGroup original
        Object.assign(this.menuGroup, this.editedMenuGroup);
        this.saved.emit(this.editedMenuGroup);
        this.visible = false;
        this.visibleChange.emit(false);
      },
      error: (err) => {
        console.error('Erreur lors de la sauvegarde:', err);
      },
    });
  }

  /**
   * Annule les modifications
   */
  onCancel(): void {
    this.visible = false;
    this.visibleChange.emit(false);
  }

  /**
   * Supprime la recette d'un menu avec confirmation
   */
  removeRecipe(menu: MenuModel): void {
    const recipeTitle = this.getRecipeTitle(menu.recipeId);
    this.confirmationService.confirm({
      message: `Voulez-vous retirer "${recipeTitle}" des idées de repas ?`,
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Oui',
      rejectLabel: 'Non',
      accept: () => {
        menu.recipeId = '';
        menu.done = false;
      },
    });
  }

  /**
   * Affiche la recette dans un dialog, adaptée au nombre de personnes du menu
   */
  viewRecipe(menu: MenuModel): void {
    const recipe = this.recipes.find((r) => r.id === menu.recipeId);
    if (recipe) {
      // Adapter la recette au nombre de personnes du menu
      this.selectedRecipe = this.menuService.getRecipeForPersonnes(recipe, menu.personnes || 4);
      this.showRecipeDialog = true;
    }
  }

  /**
   * Rafraîchit l'idée de repas avec une nouvelle suggestion aléatoire
   */
  refreshRecipe(menu: MenuModel): void {
    const currentTitle = menu.recipeId ? this.getRecipeTitle(menu.recipeId) : 'vide';
    const message = menu.recipeId
      ? `Voulez-vous remplacer "${currentTitle}" par une nouvelle idée de repas ?`
      : 'Voulez-vous suggérer une recette pour ce repas ?';

    this.confirmationService.confirm({
      message,
      header: 'Confirmation',
      icon: 'pi pi-refresh',
      acceptLabel: 'Oui',
      rejectLabel: 'Non',
      accept: () => {
        // Obtenir les IDs des recettes déjà utilisées dans ce groupe
        const usedRecipeIds = this.editedMenuGroup.menus
          .filter((m) => m.recipeId && m.num !== menu.num)
          .map((m) => m.recipeId);

        // Suggérer une nouvelle recette qui n'est pas déjà utilisée
        const suggestions = this.menuService.suggestRandomRecipes(usedRecipeIds.length + 5);
        const newRecipeId = suggestions.find(
          (id) => !usedRecipeIds.includes(id) && id !== menu.recipeId
        );

        if (newRecipeId) {
          menu.recipeId = newRecipeId;
          menu.done = false;
        }
      },
    });
  }

  /**
   * Ouvre le dialog de la liste de courses
   */
  openShoppingList(): void {
    this.showShoppingDialog = true;
  }
}
