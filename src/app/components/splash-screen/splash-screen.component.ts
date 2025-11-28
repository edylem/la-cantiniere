import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin, timer } from 'rxjs';
import { RecipeService } from '../../services/recipe.service';

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

  constructor(private recipeService: RecipeService) {}

  ngOnInit(): void {
    // Attendre que les données soient chargées ET que 3 secondes minimum soient passées
    forkJoin([this.recipeService.load(), timer(3000)]).subscribe({
      next: () => {
        this.visible = false;
        this.complete.emit();
      },
      error: (error) => {
        console.error('Erreur lors du chargement des recettes:', error);
        this.visible = false;
        this.complete.emit();
      },
    });
  }
}
