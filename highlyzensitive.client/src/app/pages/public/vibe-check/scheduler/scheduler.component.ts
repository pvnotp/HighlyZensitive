import { AsyncPipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { ConfirmAppointmentComponent } from '../confirm-appointment/confirm-appointment.component';
import { ClientDetailsComponent } from '../client-details/client-details.component';
import { DatePickerComponent } from '../date-picker/date-picker.component';
import { TimePickerComponent } from '../time-picker/time-picker.component';
import { VibeCheckActions } from '../store/vibe-check.actions';
import { ServiceType } from '../store/vibe-check.state';
import { selectSchedulerViewModel } from '../store/vibe-check.selectors';

@Component({
  selector: 'app-scheduler',
  standalone: true,
  imports: [AsyncPipe, DatePickerComponent, TimePickerComponent, ConfirmAppointmentComponent, ClientDetailsComponent],
  templateUrl: './scheduler.component.html',
  styleUrl: './scheduler.component.scss'
})
export class SchedulerComponent implements OnInit {
  private readonly store = inject(Store);

  readonly vm$ = this.store.select(selectSchedulerViewModel);

  ngOnInit(): void {
    const tomorrow = new Date();
    tomorrow.setHours(0, 0, 0, 0);
    tomorrow.setDate(tomorrow.getDate() + 1);
    this.store.dispatch(VibeCheckActions.selectDate({ date: tomorrow.toISOString() }));

    this.store.dispatch(
      VibeCheckActions.updateService({ service: { type: ServiceType.VibeCheck, duration: 15 } }),
    );
  }
}
