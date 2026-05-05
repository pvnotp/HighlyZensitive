
import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Store } from '@ngrx/store';
import { NavBarComponent } from './global/nav-bar/nav-bar.component';
import { NotificationComponent } from './global/notification/notification.component';



@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  imports: [RouterOutlet, NavBarComponent, NotificationComponent],
  standalone: true,
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'Highly Zensitive SalamanDr';
  private store = inject(Store);
}
