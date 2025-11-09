import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { RecipeModel } from '../../../models/recipe.model';

@Component({
  selector: 'app-recipe-card',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule],
  templateUrl: './recipe-card.component.html',
  styleUrls: ['./recipe-card.component.scss'],
})
export class RecipeCardComponent {
  @Input({ required: true }) recipe!: RecipeModel;
  @Output() edit = new EventEmitter<RecipeModel>();
  @Output() view = new EventEmitter<RecipeModel>();

  onEdit(): void {
    this.edit.emit(this.recipe);
  }

  onView(): void {
    this.view.emit(this.recipe);
  }
}
