import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import {
  faSnowflake,
  faSeedling,
  faSun,
  faLeaf,
  faUtensils,
  IconDefinition,
} from '@fortawesome/free-solid-svg-icons';
import { RecipeModel } from '../../../models/recipe.model';
import { MenuService } from '../../../services/menu.service';

@Component({
  selector: 'app-recipe-card',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    ConfirmDialogModule,
    ToastModule,
    FaIconComponent,
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './recipe-card.component.html',
  styleUrls: ['./recipe-card.component.scss'],
})
export class RecipeCardComponent {
  @Input({ required: true }) recipe!: RecipeModel;
  @Output() edit = new EventEmitter<RecipeModel>();
  @Output() view = new EventEmitter<RecipeModel>();
  @Output() delete = new EventEmitter<RecipeModel>();

  faUtensils = faUtensils;

  constructor(
    private menuService: MenuService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {}

  onEdit(): void {
    this.edit.emit(this.recipe);
  }

  getSeasonClass(season: string): string {
    switch (season) {
      case 'Hiver':
        return 'hiver';
      case 'Printemps':
        return 'printemps';
      case 'Été':
        return 'ete';
      case 'Automne':
        return 'automne';
      default:
        return '';
    }
  }

  getSeasonIcon(season: string): IconDefinition {
    switch (season) {
      case 'Hiver':
        return faSnowflake;
      case 'Printemps':
        return faSeedling;
      case 'Été':
        return faSun;
      case 'Automne':
        return faLeaf;
      default:
        return faSun; // fallback
    }
  }

  onView(): void {
    this.view.emit(this.recipe);
  }

  onDelete(): void {
    this.delete.emit(this.recipe);
  }

  /**
   * Calcule le nombre de jours depuis la dernière fois que la recette a été cuisinée
   * @returns Le nombre de jours ou null si jamais cuisinée
   */
  getDaysSinceLastCooked(): number | null {
    const menuGroups = this.menuService.getMenuGroups();
    let lastCookedDate: Date | null = null;

    for (const group of menuGroups) {
      for (const menu of group.menus) {
        if (menu.recipeId === this.recipe.id && menu.done) {
          const menuDate = new Date(group.date);
          if (!lastCookedDate || menuDate > lastCookedDate) {
            lastCookedDate = menuDate;
          }
        }
      }
    }

    if (!lastCookedDate) {
      return null;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    lastCookedDate.setHours(0, 0, 0, 0);
    const diffTime = today.getTime() - lastCookedDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays * -1 - 1;
  }

  /**
   * Envoie la recette au dernier menu
   */
  onSendToMenu(): void {
    const menuGroups = this.menuService.getMenuGroups();

    if (menuGroups.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Aucun menu',
        detail: "Aucun menu n'existe. Créez d'abord un menu.",
        life: 4000,
      });
      return;
    }

    // Trouver le dernier menu (le plus récent)
    const sortedGroups = [...menuGroups].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    const lastGroup = sortedGroups[0];

    // Trouver la première place vide (recipeId vide)
    const emptySlot = lastGroup.menus.find((m) => !m.recipeId || m.recipeId === '');

    if (!emptySlot) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Menu complet',
        detail: 'Le menu actuel est complet. Créez un nouveau menu.',
        life: 4000,
      });
      return;
    }

    // Demander confirmation
    this.confirmationService.confirm({
      message: `Ajouter "${this.recipe.title}" au menu du ${this.formatDate(
        lastGroup.date
      )} (emplacement ${emptySlot.num}) ?`,
      header: 'Envoyer au menu',
      icon: 'pi pi-calendar-plus',
      acceptLabel: 'Ajouter',
      rejectLabel: 'Annuler',
      accept: () => {
        emptySlot.recipeId = this.recipe.id;
        this.menuService.update(lastGroup).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Ajouté',
              detail: `"${this.recipe.title}" ajouté au menu.`,
              life: 3000,
            });
          },
          error: (err) => {
            console.error('Erreur ajout au menu:', err);
            this.messageService.add({
              severity: 'error',
              summary: 'Erreur',
              detail: "Impossible d'ajouter au menu.",
              life: 4000,
            });
          },
        });
      },
    });
  }

  private formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
    });
  }
}
