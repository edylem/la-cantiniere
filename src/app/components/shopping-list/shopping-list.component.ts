import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { MenuGroupModel } from '../../models/menu.model';
import { MenuService, ShoppingItem } from '../../services/menu.service';

@Component({
  selector: 'app-shopping-list',
  standalone: true,
  imports: [CommonModule, DialogModule, ButtonModule],
  templateUrl: './shopping-list.component.html',
  styleUrls: ['./shopping-list.component.scss'],
})
export class ShoppingListComponent implements OnChanges {
  @Input() visible = false;
  @Input() menuGroup?: MenuGroupModel; // Si fourni, génère la liste pour ce groupe uniquement
  @Output() visibleChange = new EventEmitter<boolean>();

  shoppingList: ShoppingItem[] = [];

  constructor(private menuService: MenuService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible'] && this.visible) {
      if (this.menuGroup) {
        // Liste de courses pour un groupe spécifique (seulement les repas non cuisinés)
        const filteredGroup = {
          ...this.menuGroup,
          menus: this.menuGroup.menus.filter((m) => m.recipeId && !m.done),
        };
        this.shoppingList = this.menuService.generateShoppingList(filteredGroup);
      } else {
        // Liste de courses globale
        this.generateGlobalShoppingList();
      }
    }
  }

  /**
   * Génère la liste de courses globale pour tous les repas non cuisinés
   */
  generateGlobalShoppingList(): void {
    const menuGroups = this.menuService.getMenuGroups();
    const itemsMap = new Map<string, ShoppingItem>();

    // Parcourir tous les groupes de menus
    for (const menuGroup of menuGroups) {
      // Ne prendre que les repas qui ne sont pas encore cuisinés
      for (const menu of menuGroup.menus) {
        if (!menu.recipeId || menu.done) continue;

        // Utiliser generateShoppingList pour un groupe temporaire
        const tempGroup = {
          ...menuGroup,
          menus: [menu],
        };
        const items = this.menuService.generateShoppingList(tempGroup);

        // Agréger les résultats
        for (const item of items) {
          const key = `${item.name.toLowerCase()}|${item.unit.toLowerCase()}`;
          if (itemsMap.has(key)) {
            const existing = itemsMap.get(key)!;
            existing.quantity += item.quantity;
          } else {
            itemsMap.set(key, { ...item });
          }
        }
      }
    }

    // Convertir en tableau et trier par nom
    this.shoppingList = Array.from(itemsMap.values()).sort((a, b) =>
      a.name.toLowerCase().localeCompare(b.name.toLowerCase())
    );
  }

  /**
   * Copie la liste de courses dans le presse-papier
   */
  copyToClipboard(): void {
    const text = this.shoppingList
      .map((item) => `${item.name}: ${item.quantity} ${item.unit}`)
      .join('\n');

    navigator.clipboard.writeText(text).then(() => {
      this.visible = false;
      this.visibleChange.emit(false);
    });
  }

  onHide(): void {
    this.visibleChange.emit(false);
  }
}
