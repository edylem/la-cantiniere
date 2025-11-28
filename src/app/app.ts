import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { TitleBarComponent } from './components/title-bar/title-bar.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastModule, TitleBarComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = signal('la-cantiniere');
}
