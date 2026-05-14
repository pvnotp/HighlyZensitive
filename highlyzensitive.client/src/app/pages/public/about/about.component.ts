import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AttributionComponent } from '../../../global/attribution/attribution.component';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [RouterLink, AttributionComponent],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss'
})
export class AboutComponent {
}
