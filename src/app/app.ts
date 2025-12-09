import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { SplashScreenComponent } from './components/splash-screen/splash-screen.component';
import { TitleBarComponent } from './components/title-bar/title-bar.component';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, ToastModule, TitleBarComponent, SplashScreenComponent],
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
