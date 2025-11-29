import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MenuGroupCardComponent } from '../card/menu-group-card.component';
import { MenuService } from '../../../services/menu.service';
import { MenuGroupModel, MenuModel } from '../../../models/menu.model';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DatePickerModule } from 'primeng/datepicker';
import { InputNumberModule } from 'primeng/inputnumber';

@Component({
  selector: 'app-menu-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MenuGroupCardComponent,
    ButtonModule,
    DialogModule,
    DatePickerModule,
    InputNumberModule,
  ],
  templateUrl: './menu-list.component.html',
  styleUrls: ['./menu-list.component.scss'],
})
export class MenuListComponent {
  showAddDialog = false;
  newMenuDate: Date = new Date();
  newMenuMealsCount: number = 7;

  constructor(private menuService: MenuService) {}

  /**
   * Récupère les groupes de menus triés par date décroissante
   */
  get menuGroups(): MenuGroupModel[] {
    return this.menuService.getMenuGroups().sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }

  /**
   * Vérifie si des menus existent
   */
  get hasMenus(): boolean {
    return this.menuGroups.length > 0;
  }

  /**
   * Ouvre la modal d'ajout de menu
   */
  onAddMenu(): void {
    this.newMenuDate = new Date();
    this.newMenuMealsCount = 7;
    this.showAddDialog = true;
  }

  /**
   * Crée un nouveau groupe de menus
   */
  onCreateMenu(): void {
    if (this.newMenuMealsCount < 1) {
      return;
    }

    // Créer les menus vides
    const menus: MenuModel[] = [];
    for (let i = 1; i <= this.newMenuMealsCount; i++) {
      menus.push({
        num: i,
        recipeId: '',
        done: false,
      });
    }

    // Créer le groupe avec le nombre de repas
    this.menuService.createWithMeals(menus, this.newMenuDate, this.newMenuMealsCount).subscribe({
      next: () => {
        this.showAddDialog = false;
      },
      error: (err) => {
        console.error('Erreur lors de la création du menu:', err);
      },
    });
  }

  /**
   * Annule l'ajout
   */
  onCancelAdd(): void {
    this.showAddDialog = false;
  }
}
