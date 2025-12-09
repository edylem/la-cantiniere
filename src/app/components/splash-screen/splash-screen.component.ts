import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin, timer } from 'rxjs';
import { tap } from 'rxjs/operators';
import { RecipeService } from '../../services/recipe.service';
import { MenuService } from '../../services/menu.service';
import { IngredientService } from '../../services/ingredient.service';

@Component({
  selector: 'app-splash-screen',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './splash-screen.component.html',
  styleUrls: ['./splash-screen.component.scss'],
})
export class SplashScreenComponent implements OnInit {
  visible = true;
  @Output() complete = new EventEmitter<void>();

  constructor(
    private recipeService: RecipeService,
    private menuService: MenuService,
    private ingredientService: IngredientService
  ) {}

  ngOnInit(): void {
    // Attendre que les données soient chargées ET que 3 secondes minimum soient passées
    forkJoin([
      this.recipeService.load().pipe(
        tap(() => {
          // Charger les ingrédients et unités une fois les recettes chargées
          this.ingredientService.load(this.recipeService.getRecipes());
        })
      ),
      this.menuService.load(),
      timer(3000),
    ]).subscribe({
      next: () => {
        this.visible = false;
        this.complete.emit();
      },
      error: (error) => {
        console.error('Erreur lors du chargement des données:', error);
        this.visible = false;
        this.complete.emit();
      },
    });
  }
}
