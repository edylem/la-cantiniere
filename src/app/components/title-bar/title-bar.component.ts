import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Menu, MenuModule } from 'primeng/menu';
import { ButtonModule } from 'primeng/button';
import { MenuItem } from 'primeng/api';
import { RecipeService } from '../../services/recipe.service';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-title-bar',
  standalone: true,
  imports: [CommonModule, MenuModule, ButtonModule, ToastModule],
  providers: [MessageService],
  templateUrl: './title-bar.component.html',
  styleUrls: ['./title-bar.component.scss'],
})
export class TitleBarComponent {
  @ViewChild('menu') menu!: Menu;

  menuItems: MenuItem[] = [
    {
      label: 'Exporter (JSON)',
      icon: 'pi pi-download',
      command: () => this.onDownload(),
    },
  ];

  constructor(private recipeService: RecipeService, private messageService: MessageService) {}

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
}
