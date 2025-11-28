import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenubarModule } from 'primeng/menubar';
import { MenuItem } from 'primeng/api';
import { RecipeService } from '../../services/recipe.service';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-title-bar',
  standalone: true,
  imports: [CommonModule, MenubarModule, ToastModule],
  providers: [MessageService],
  templateUrl: './title-bar.component.html',
  styleUrls: ['./title-bar.component.scss'],
})
export class TitleBarComponent {
  menuItems: MenuItem[] = [
    {
      label: 'Fichier',
      items: [
        {
          label: 'Charger (fichier local)',
          icon: 'pi pi-upload',
          command: () => this.onLoadFromFile(),
        },
        {
          label: 'Charger depuis Firestore',
          icon: 'pi pi-cloud-download',
          command: () => this.onLoadFromFirestore(),
        },
        { separator: true },
        {
          label: 'Sauvegarder vers Firestore',
          icon: 'pi pi-cloud-upload',
          command: () => this.onSaveToFirestore(),
        },
        {
          label: 'Télécharger (fichier local)',
          icon: 'pi pi-download',
          command: () => this.onDownload(),
        },
      ],
    },
  ];

  constructor(private recipeService: RecipeService, private messageService: MessageService) {}

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

  async onLoadFromFirestore(): Promise<void> {
    try {
      const count = await this.recipeService.loadFromFirestore();
      this.messageService.add({
        severity: 'success',
        summary: 'Chargement Firestore',
        detail: `${count} recettes chargées depuis Firestore`,
        life: 3000,
      });
    } catch (err: any) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: err?.message || 'Erreur chargement Firestore',
        life: 4000,
      });
    }
  }

  async onSaveToFirestore(): Promise<void> {
    try {
      await this.recipeService.saveToFirestore();
      this.messageService.add({
        severity: 'success',
        summary: 'Sauvegarde Firestore',
        detail: 'Recettes sauvegardées vers Firestore',
        life: 3000,
      });
    } catch (err: any) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: err?.message || 'Erreur sauvegarde Firestore',
        life: 4000,
      });
    }
  }
}
