import { Component, HostListener, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './services.component.html',
  styleUrl: './services.component.scss'
})
export class ServicesComponent implements OnInit {
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

  shortDesktop = signal(false);
  private readonly SHORT_HEIGHT = 700;
  private readonly DESKTOP_WIDTH = 1024;

  ngOnInit(): void {
    this.checkViewport();
  }

  @HostListener('window:resize')
  checkViewport(): void {
    const wasShortDesktop = this.shortDesktop();
    const isShortDesktop = window.innerWidth >= this.DESKTOP_WIDTH && window.innerHeight < this.SHORT_HEIGHT;
    this.shortDesktop.set(isShortDesktop);
    if (isShortDesktop && !wasShortDesktop) {
      this.expandedPanels[1] = true;
      this.expandedPanels[2] = false;
    }
  }

  togglePanel(index: number): void {
    if (this.shortDesktop() && (index === 1 || index === 2)) {
      const other = index === 1 ? 2 : 1;
      this.expandedPanels[index] = !this.expandedPanels[index];
      this.expandedPanels[other] = !this.expandedPanels[index];
    } else {
      this.expandedPanels[index] = !this.expandedPanels[index];
    }
  }

  toggleSubPanel(index: number): void {
    this.expandedSubPanels[index] = !this.expandedSubPanels[index];
  }
}