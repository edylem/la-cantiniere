import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { TitleBarComponent } from './components/title-bar/title-bar.component';
import { SplashScreenComponent } from './components/splash-screen/splash-screen.component';
import { SeedRecipesComponent } from './utils/seed-recipes.component';

@Component({
  selector: 'app-root',
  imports: [
    CommonModule,
    RouterOutlet,
    ToastModule,
    TitleBarComponent,
    SplashScreenComponent,
    SeedRecipesComponent,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = signal('la-cantiniere');
  showSplash = true;

  onSplashComplete(): void {
    this.showSplash = false;
  }
}
