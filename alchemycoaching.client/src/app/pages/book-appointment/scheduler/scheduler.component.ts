import { AsyncPipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { ConfirmAppointmentComponent } from '../confirm-appointment/confirm-appointment.component';
import { ClientDetailsComponent } from '../client-details/client-details.component';
import { DatePickerComponent } from '../date-picker/date-picker.component';
import { TimePickerComponent } from '../time-picker/time-picker.component';
import { BookAppointmentActions } from '../store/book-appointment.actions';
import { ServiceType } from '../store/book-appointment.state';
import { selectSchedulerViewModel } from '../store/book-appointment.selectors';

@Component({
  selector: 'app-scheduler',
  standalone: true,
  imports: [AsyncPipe, DatePickerComponent, TimePickerComponent, ConfirmAppointmentComponent, ClientDetailsComponent],
  templateUrl: './scheduler.component.html',
  styleUrl: './scheduler.component.scss'
})
export class SchedulerComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly store = inject(Store);

  readonly vm$ = this.store.select(selectSchedulerViewModel);

  ngOnInit(): void {
    const tomorrow = new Date();
    tomorrow.setHours(0, 0, 0, 0);
    tomorrow.setDate(tomorrow.getDate() + 1);
    this.store.dispatch(BookAppointmentActions.selectDate({ date: tomorrow.toISOString() }));

    this.route.queryParamMap.subscribe((params) => {
      const type = params.get('type') ?? '';
      const duration = parseInt(params.get('duration') ?? '15', 10);
      const serviceType =
        type.trim().toLowerCase() === 'vibe check'
          ? ServiceType.VibeCheck
          : ServiceType.VibeCheck;
      this.store.dispatch(
        BookAppointmentActions.updateService({ service: { type: serviceType, duration } }),
      );
    });
  }
}
