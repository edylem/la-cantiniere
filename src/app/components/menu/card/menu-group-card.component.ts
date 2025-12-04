import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { MenuGroupModel, MenuModel } from '../../../models/menu.model';
import { RecipeModel } from '../../../models/recipe.model';
import { RecipeService } from '../../../services/recipe.service';
import { MenuService } from '../../../services/menu.service';
import { MenuFormComponent } from '../form/menu-form.component';
import { ShoppingListComponent } from '../../shopping-list/shopping-list.component';
import { RecipeFormComponent } from '../../recipe/form/recipe-form.component';

@Component({
  selector: 'app-menu-group-card',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    ConfirmDialogModule,
    MenuFormComponent,
    ShoppingListComponent,
    RecipeFormComponent,
  ],
  providers: [ConfirmationService],
  templateUrl: './menu-group-card.component.html',
  styleUrls: ['./menu-group-card.component.scss'],
})
export class MenuGroupCardComponent {
  @Input() menuGroup!: MenuGroupModel;
  showEditDialog = false;
  showShoppingDialog = false;
  showRecipeDialog = false;
  selectedRecipe?: RecipeModel;

  constructor(
    private recipeService: RecipeService,
    private menuService: MenuService,
    private confirmationService: ConfirmationService
  ) {}

  /**
   * Récupère le titre de la recette par son ID
   */
  getRecipeTitle(recipeId: string): string {
    const recipes = this.recipeService.getRecipes();
    const recipe = recipes.find((r) => r.id === recipeId);
    return recipe?.title || 'Recette inconnue';
  }

  /**
   * Formate la date pour l'affichage
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
   * Ouvre le formulaire d'édition
   */
  onEdit(): void {
    this.showEditDialog = true;
  }

  /**
   * Supprime le groupe de menus après confirmation
   */
  onDelete(): void {
    this.confirmationService.confirm({
      message: 'Voulez-vous vraiment supprimer ce menu ?',
      header: 'Confirmation de suppression',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Supprimer',
      rejectLabel: 'Annuler',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.menuService.delete(this.menuGroup.id).subscribe();
      },
    });
  }

  /**
   * Affiche la recette adaptée au nombre de personnes du menu
   */
  viewRecipe(menu: MenuModel): void {
    const recipes = this.recipeService.getRecipes();
    const recipe = recipes.find((r) => r.id === menu.recipeId);
    if (recipe) {
      this.selectedRecipe = this.menuService.getRecipeForPersonnes(recipe, menu.personnes || 4);
      this.showRecipeDialog = true;
    }
  }
}
