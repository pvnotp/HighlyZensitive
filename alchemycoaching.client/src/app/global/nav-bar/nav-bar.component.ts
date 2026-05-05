import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-nav-bar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './nav-bar.component.html',
  styleUrl: './nav-bar.component.scss'
})
export class NavBarComponent {
  showDropdownMenu = false;

  toggleDropdownMenu(): void {
    this.showDropdownMenu = !this.showDropdownMenu;
  }

  collapseDropdownMenu(): void {
    this.showDropdownMenu = false;
  }
}
