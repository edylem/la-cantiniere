import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/recipe/list/recipe-list.component').then((m) => m.RecipeListComponent),
  },
  {
    path: 'menus',
    loadComponent: () =>
      import('./components/menu/list/menu-list.component').then((m) => m.MenuListComponent),
  },
];
