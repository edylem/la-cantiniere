import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RecipeModel } from '../../../models/recipe.model';
import { RecipeCardComponent } from '../card/recipe-card.component';
import { RecipeFormComponent } from '../form/recipe-form.component';
import { RecipeFilterComponent, RecipeFilters } from '../filter/recipe-filter.component';
import { RecipeService } from '../../../services/recipe.service';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-recipe-list',
  standalone: true,
  providers: [MessageService, ConfirmationService],
  imports: [
    CommonModule,
    FormsModule,
    RecipeCardComponent,
    RecipeFormComponent,
    RecipeFilterComponent,
    ButtonModule,
    InputTextModule,
    ToastModule,
    ConfirmDialogModule,
  ],
  templateUrl: './recipe-list.component.html',
  styleUrls: ['./recipe-list.component.scss'],
})
export class RecipeListComponent {
  showFormDialog = false;
  showFilterDialog = false;
  selectedRecipe?: RecipeModel;
  isReadOnly = false;
  currentFilters: RecipeFilters = {
    name: '',
    seasons: [],
    categories: [],
    ingredients: ['', '', '', ''],
    maxPrepTime: null,
    maxCost: null,
    minPersonnes: null,
    maxPersonnes: null,
  };

  // Filtre rapide
  quickFilter = '';

  constructor(
    private recipeService: RecipeService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  /**
   * Récupère les recettes filtrées depuis le cache du service
   */
  get recipes(): RecipeModel[] {
    return this.applyFilters(this.recipeService.getRecipes());
  }

  /**
   * Applique les filtres aux recettes
   */
  private applyFilters(recipes: RecipeModel[]): RecipeModel[] {
    return recipes.filter((recipe) => {
      // Filtre rapide (recherche dans tous les textes)
      if (this.quickFilter.trim() !== '') {
        const searchTerm = this.quickFilter.toLowerCase().trim();
        const searchableText = [
          recipe.title,
          recipe.description,
          ...(recipe.ingredients || []).map((i) => i.name),
          ...(recipe.season || []),
          ...(recipe.category || []),
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        if (!searchableText.includes(searchTerm)) {
          return false;
        }
      }

      // Filtre par nom
      if (this.currentFilters.name.trim() !== '') {
        if (!recipe.title.toLowerCase().includes(this.currentFilters.name.toLowerCase().trim())) {
          return false;
        }
      }

      // Filtre par saison
      if (this.currentFilters.seasons.length > 0) {
        if (!recipe.season || !recipe.season.some((s) => this.currentFilters.seasons.includes(s))) {
          return false;
        }
      }

      // Filtre par catégorie
      if (this.currentFilters.categories.length > 0) {
        if (
          !recipe.category ||
          !recipe.category.some((c) => this.currentFilters.categories.includes(c))
        ) {
          return false;
        }
      }

      // Filtre par temps de préparation
      if (this.currentFilters.maxPrepTime !== null) {
        if (!recipe.prepTime || recipe.prepTime > this.currentFilters.maxPrepTime) {
          return false;
        }
      }

      // Filtre par coût
      if (this.currentFilters.maxCost !== null) {
        if (!recipe.cost || recipe.cost > this.currentFilters.maxCost) {
          return false;
        }
      }

      // Filtre par nombre de personnes min
      if (this.currentFilters.minPersonnes !== null) {
        if (!recipe.personnes || recipe.personnes < this.currentFilters.minPersonnes) {
          return false;
        }
      }

      // Filtre par nombre de personnes max
      if (this.currentFilters.maxPersonnes !== null) {
        if (!recipe.personnes || recipe.personnes > this.currentFilters.maxPersonnes) {
          return false;
        }
      }

      // Filtre par ingrédients
      const activeIngredientFilters = this.currentFilters.ingredients.filter(
        (i) => i.trim() !== ''
      );
      if (activeIngredientFilters.length > 0) {
        const recipeIngredientNames = (recipe.ingredients || []).map((ing) =>
          ing.name.toLowerCase()
        );
        for (const filterIngredient of activeIngredientFilters) {
          const found = recipeIngredientNames.some((name) =>
            name.includes(filterIngredient.toLowerCase().trim())
          );
          if (!found) {
            return false;
          }
        }
      }

      return true;
    });
  }

  onOpenFilter(): void {
    this.showFilterDialog = true;
  }

  onFiltersChange(filters: RecipeFilters): void {
    this.currentFilters = filters;
  }

  get hasActiveFilters(): boolean {
    return (
      this.currentFilters.name.trim() !== '' ||
      this.currentFilters.seasons.length > 0 ||
      this.currentFilters.categories.length > 0 ||
      this.currentFilters.ingredients.some((i) => i.trim() !== '') ||
      this.currentFilters.maxPrepTime !== null ||
      this.currentFilters.maxCost !== null ||
      this.currentFilters.minPersonnes !== null ||
      this.currentFilters.maxPersonnes !== null
    );
  }

  onNewRecipe(): void {
    this.selectedRecipe = undefined;
    this.isReadOnly = false;
    this.showFormDialog = true;
  }

  onViewRecipe(recipe: RecipeModel): void {
    this.selectedRecipe = recipe;
    this.isReadOnly = true;
    this.showFormDialog = true;
  }

  onEditRecipe(recipe: RecipeModel): void {
    this.selectedRecipe = recipe;
    this.isReadOnly = false;
    this.showFormDialog = true;
  }

  onSaveRecipe(recipe: RecipeModel): void {
    this.recipeService.saveRecipe(recipe).subscribe({
      next: (isUpdate) => {
        this.messageService.add({
          severity: 'success',
          summary: isUpdate ? 'Mise à jour' : 'Création',
          detail: `Recette "${recipe.title}" ${isUpdate ? 'mise à jour' : 'créée'} avec succès`,
          life: 3000,
        });
        this.showFormDialog = false;
        this.selectedRecipe = undefined;
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Erreur lors de la sauvegarde',
          life: 4000,
        });
      },
    });
  }

  onCancelForm(): void {
    this.showFormDialog = false;
    this.selectedRecipe = undefined;
    this.isReadOnly = false;
  }

  onDeleteRecipe(recipe: RecipeModel): void {
    this.confirmationService.confirm({
      message: `Voulez-vous vraiment supprimer la recette "${recipe.title}" ?`,
      header: 'Confirmation de suppression',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Supprimer',
      rejectLabel: 'Annuler',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.recipeService.deleteRecipe(recipe.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Suppression',
              detail: `Recette "${recipe.title}" supprimée avec succès`,
              life: 3000,
            });
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Erreur',
              detail: 'Erreur lors de la suppression',
              life: 4000,
            });
          },
        });
      },
    });
  }
}
