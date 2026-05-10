import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './services.component.html',
  styleUrl: './services.component.scss'
})
export class ServicesComponent {
  expandedPanels: { [key: number]: boolean } = {
    0: false,
    1: false,
    2: false
  };

  expandedSubPanels: { [key: number]: boolean } = {
    0: false,
    1: false,
    2: false
  };

  togglePanel(index: number): void {
    this.expandedPanels[index] = !this.expandedPanels[index];
  }

  toggleSubPanel(index: number): void {
    this.expandedSubPanels[index] = !this.expandedSubPanels[index];
  }
}