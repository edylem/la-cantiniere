import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RecipeModel } from '../../../models/recipe.model';
import { RecipeCardComponent } from '../card/recipe-card.component';
import { RecipeFormComponent } from '../form/recipe-form.component';
import { RecipeService } from '../../../services/recipe.service';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-recipe-list',
  standalone: true,
  providers: [MessageService],
  imports: [CommonModule, RecipeCardComponent, RecipeFormComponent, ButtonModule, ToastModule],
  templateUrl: './recipe-list.component.html',
  styleUrls: ['./recipe-list.component.scss'],
})
export class RecipeListComponent {
  showFormDialog = false;
  selectedRecipe?: RecipeModel;
  isReadOnly = false;
  // Le composant lit les recettes depuis le service. Si le service ne contient
  // aucune recette au démarrage, on déclenche `loadData()` pour inviter
  // l'utilisateur à sélectionner un fichier JSON.
  constructor(private recipeService: RecipeService, private messageService: MessageService) {}

  async ngOnInit(): Promise<void> {
    const current = this.recipeService.getRecipes();
    if (!current || current.length === 0) {
      try {
        // Do not force open file selector on init; prefer to offer the user a button.
        // Keep behavior non-intrusive: skip automatic load but leave method available.
        // await this.recipeService.loadData();
        // Instead, optionally load example data if present in assets
        // await this.recipeService.loadFromUrl('assets/data/recipes.json');
        // We'll not auto-load to avoid browser popups; user can click Charger.
      } catch (e) {
        // L'utilisateur peut annuler la sélection de fichier — on ignore l'erreur
        // mais on pourrait afficher une notification si souhaité.
        // console.warn('Aucun fichier chargé:', e);
      }
    }
  }

  // Le template itère sur la valeur du signal readonly exposé par le service
  recipesSignal() {
    return this.recipeService.recipes$();
  }

  async onLoadFromFile(): Promise<void> {
    try {
      const count = await this.recipeService.loadData();
      this.messageService.add({
        severity: 'success',
        summary: 'Chargement',
        detail: `${count} recettes chargées`,
        life: 3000,
      });
    } catch (err: any) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: err?.message || 'Erreur chargement',
        life: 4000,
      });
    }
  }

  async onLoadExamples(): Promise<void> {
    try {
      const count = await this.recipeService.loadFromUrl('assets/data/recipes.json');
      this.messageService.add({
        severity: 'success',
        summary: 'Chargement exemples',
        detail: `${count} recettes chargées`,
        life: 3000,
      });
    } catch (err: any) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: err?.message || 'Erreur chargement exemples',
        life: 4000,
      });
    }
  }

  onDownload(): void {
    try {
      this.recipeService.downloadData();
      this.messageService.add({
        severity: 'success',
        summary: 'Export',
        detail: 'Téléchargement lancé',
        life: 2000,
      });
    } catch (err: any) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: err?.message || 'Erreur export',
        life: 4000,
      });
    }
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
    const isUpdate = this.recipeService.saveRecipe(recipe);
    this.messageService.add({
      severity: 'success',
      summary: isUpdate ? 'Mise à jour' : 'Création',
      detail: `Recette "${recipe.title}" ${isUpdate ? 'mise à jour' : 'créée'} avec succès`,
      life: 3000,
    });
    this.showFormDialog = false;
    this.selectedRecipe = undefined;
  }

  onCancelForm(): void {
    this.showFormDialog = false;
    this.selectedRecipe = undefined;
    this.isReadOnly = false;
  }
}
