import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AttributionComponent } from '../../../global/attribution/attribution.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, AttributionComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
}
