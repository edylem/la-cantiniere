import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'recipes',
    loadComponent: () =>
      import('./components/recipe/list/recipe-list.component').then((m) => m.RecipeListComponent),
  },
  {
    path: '',
    redirectTo: '/recipes',
    pathMatch: 'full',
  },
];
