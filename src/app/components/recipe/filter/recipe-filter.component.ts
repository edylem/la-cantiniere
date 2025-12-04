import { Component, EventEmitter, Input, Output, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { MultiSelectModule } from 'primeng/multiselect';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { ALL_SEASONS, ALL_CATEGORIES } from '../../../models/recipe.model';

export interface RecipeFilters {
  name: string;
  seasons: string[];
  categories: string[];
  ingredients: string[];
  maxPrepTime: number | null;
  maxCost: number | null;
  minPersonnes: number | null;
  maxPersonnes: number | null;
}

@Component({
  selector: 'app-recipe-filter',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DialogModule,
    MultiSelectModule,
    InputNumberModule,
    InputTextModule,
    ButtonModule,
  ],
  templateUrl: './recipe-filter.component.html',
  styleUrls: ['./recipe-filter.component.scss'],
})
export class RecipeFilterComponent implements OnChanges {
  @Input() visible = false;
  @Input() initialFilters: RecipeFilters = {
    name: '',
    seasons: [],
    categories: [],
    ingredients: ['', '', '', ''],
    maxPrepTime: null,
    maxCost: null,
    minPersonnes: null,
    maxPersonnes: null,
  };
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() filtersChange = new EventEmitter<RecipeFilters>();

  filters: RecipeFilters = {
    name: '',
    seasons: [],
    categories: [],
    ingredients: ['', '', '', ''],
    maxPrepTime: null,
    maxCost: null,
    minPersonnes: null,
    maxPersonnes: null,
  };

  seasonOptions = ALL_SEASONS.map((s) => ({ label: s, value: s }));
  categoryOptions = ALL_CATEGORIES.map((c) => ({ label: c, value: c }));

  ngOnChanges(): void {
    // Copier les filtres initiaux quand la modal s'ouvre (deep copy pour les tableaux)
    if (this.visible) {
      this.filters = {
        ...this.initialFilters,
        name: this.initialFilters.name,
        seasons: [...this.initialFilters.seasons],
        categories: [...this.initialFilters.categories],
        ingredients: [...this.initialFilters.ingredients],
      };
    }
  }

  onApply(): void {
    this.filtersChange.emit({ ...this.filters });
    this.visible = false;
    this.visibleChange.emit(false);
  }

  onCancel(): void {
    // Restaurer les filtres initiaux sans émettre de changement
    this.filters = { ...this.initialFilters };
    this.visible = false;
    this.visibleChange.emit(false);
  }

  onReset(): void {
    this.filters = {
      name: '',
      seasons: [],
      categories: [],
      ingredients: ['', '', '', ''],
      maxPrepTime: null,
      maxCost: null,
      minPersonnes: null,
      maxPersonnes: null,
    };
    // Appliquer immédiatement le reset
    this.filtersChange.emit({ ...this.filters });
    this.visible = false;
    this.visibleChange.emit(false);
  }
}
