import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { StateService } from '@services/state.service';
import { NavMenuComponent } from '@components/home/nav-menu.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavMenuComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  stateService = inject(StateService);
  protected readonly title = signal('Wigeon Admin Console');
}
