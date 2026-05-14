import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-attribution',
  standalone: true,
  templateUrl: './attribution.component.html',
  styleUrl: './attribution.component.scss'
})
export class AttributionComponent {
  @Input() text = '';
}
