import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Menu, MenuModule } from 'primeng/menu';
import { ButtonModule } from 'primeng/button';
import { MenuItem, ConfirmationService } from 'primeng/api';
import { RecipeService } from '../../services/recipe.service';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

@Component({
  selector: 'app-title-bar',
  standalone: true,
  imports: [CommonModule, MenuModule, ButtonModule, ToastModule, ConfirmDialogModule],
  providers: [MessageService, ConfirmationService],
  templateUrl: './title-bar.component.html',
  styleUrls: ['./title-bar.component.scss'],
})
export class TitleBarComponent {
  @ViewChild('menu') menu!: Menu;

  menuItems: MenuItem[] = [
    {
      label: 'Recettes',
      icon: 'pi pi-book',
      command: () => this.router.navigate(['/recipes']),
    },
    {
      label: 'Idées de Repas',
      icon: 'pi pi-calendar',
      command: () => this.router.navigate(['/menus']),
    },
    {
      separator: true,
    },
    {
      label: 'Importer (JSON)',
      icon: 'pi pi-download',
      command: () => this.onImport(),
    },
    {
      label: 'Exporter (JSON)',
      icon: 'pi pi-upload',
      command: () => this.onDownload(),
    },
  ];

  constructor(
    private recipeService: RecipeService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private router: Router
  ) {}

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

  onImport(): void {
    this.confirmationService.confirm({
      message:
        'Attention : toutes les recettes existantes seront supprimées et remplacées par celles du fichier importé. Continuer ?',
      header: "Confirmation d'import",
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Oui, importer',
      rejectLabel: 'Annuler',
      accept: () => {
        this.recipeService.importRecipes().subscribe({
          next: (count) => {
            this.messageService.add({
              severity: 'success',
              summary: 'Import réussi',
              detail: `${count} recettes importées`,
              life: 3000,
            });
          },
          error: (err: any) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Erreur',
              detail: err?.message || 'Erreur import',
              life: 4000,
            });
          },
        });
      },
    });
  }
}
