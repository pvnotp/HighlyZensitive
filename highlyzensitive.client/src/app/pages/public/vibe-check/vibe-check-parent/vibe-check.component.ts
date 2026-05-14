import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { ConfirmAppointmentComponent } from '../confirm-appointment/confirm-appointment.component';
import { ClientDetailsComponent } from '../client-details/client-details.component';
import { DatePickerComponent } from '../date-picker/date-picker.component';
import { TimePickerComponent } from '../time-picker/time-picker.component';
import { selectVibeCheckViewModel } from '../store/vibe-check.selectors';
import { AttributionComponent } from '../../../../global/attribution/attribution.component';

@Component({
  selector: 'app-vibe-check',
  standalone: true,
  imports: [AsyncPipe, DatePickerComponent, TimePickerComponent, ConfirmAppointmentComponent, ClientDetailsComponent, AttributionComponent],
  templateUrl: './vibe-check.component.html',
  styleUrls: ['./vibe-check.component.scss']
})
export class VibeCheckComponent {
  private readonly store = inject(Store);

  readonly vm$ = this.store.select(selectVibeCheckViewModel);
}
