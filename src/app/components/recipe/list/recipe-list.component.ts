import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RecipeModel } from '../../../models/recipe.model';
import { RecipeCardComponent } from '../card/recipe-card.component';
import { RecipeFormComponent } from '../form/recipe-form.component';
import { RecipeService } from '../../../services/recipe.service';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-recipe-list',
  standalone: true,
  providers: [MessageService],
  imports: [CommonModule, RecipeCardComponent, RecipeFormComponent, ButtonModule],
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

  // Le template itère sur la valeur du signal readonly exposé par le service
  recipesSignal() {
    return this.recipeService.recipes$();
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

  async onSaveRecipe(recipe: RecipeModel): Promise<void> {
    try {
      const isUpdate = await this.recipeService.saveRecipe(recipe);
      this.messageService.add({
        severity: 'success',
        summary: isUpdate ? 'Mise à jour' : 'Création',
        detail: `Recette "${recipe.title}" ${isUpdate ? 'mise à jour' : 'créée'} avec succès`,
        life: 3000,
      });
      this.showFormDialog = false;
      this.selectedRecipe = undefined;
    } catch (error) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Erreur lors de la sauvegarde',
        life: 4000,
      });
    }
  }

  onCancelForm(): void {
    this.showFormDialog = false;
    this.selectedRecipe = undefined;
    this.isReadOnly = false;
  }
}
