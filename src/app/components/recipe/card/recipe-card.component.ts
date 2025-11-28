import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import {
  faSnowflake,
  faSeedling,
  faSun,
  faLeaf,
  IconDefinition,
} from '@fortawesome/free-solid-svg-icons';
import { RecipeModel } from '../../../models/recipe.model';

@Component({
  selector: 'app-recipe-card',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule, FaIconComponent],
  templateUrl: './recipe-card.component.html',
  styleUrls: ['./recipe-card.component.scss'],
})
export class RecipeCardComponent {
  @Input({ required: true }) recipe!: RecipeModel;
  @Output() edit = new EventEmitter<RecipeModel>();
  @Output() view = new EventEmitter<RecipeModel>();
  @Output() delete = new EventEmitter<RecipeModel>();

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
}
