import { Component, EventEmitter, Input, Output, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { DatePickerModule } from 'primeng/datepicker';
import { MenuGroupModel, MenuModel } from '../../../models/menu.model';
import { RecipeModel } from '../../../models/recipe.model';
import { RecipeService } from '../../../services/recipe.service';
import { MenuService } from '../../../services/menu.service';

@Component({
  selector: 'app-menu-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DialogModule,
    ButtonModule,
    CheckboxModule,
    DatePickerModule,
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

  constructor(
    private recipeService: RecipeService,
    private menuService: MenuService
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
      menus: this.menuGroup.menus.map((m) => ({ ...m })),
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
   * Supprime la recette d'un menu
   */
  removeRecipe(menu: MenuModel): void {
    menu.recipeId = '';
    menu.done = false;
  }
}
