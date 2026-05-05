import { AsyncPipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { SetAppointmentActions } from '../store/set-appointment.actions';
import { selectTimePickerViewModel, TimeSlotViewModel } from '../store/set-appointment.selectors';
import { TimePickerStatus, TimeSlot } from '../store/set-appointment.state';

@Component({
  selector: 'app-time-picker',
  standalone: true,
  imports: [AsyncPipe],
  templateUrl: './time-picker.component.html',
  styleUrl: './time-picker.component.scss'
})
export class TimePickerComponent implements OnInit {
  private readonly store = inject(Store);

  readonly TimePickerStatus = TimePickerStatus;
  readonly vm$ = this.store.select(selectTimePickerViewModel);

  ngOnInit(): void {
    // Initial slot load is triggered by scheduler dispatching selectDate on init.
    // Nothing to do here.
  }

  onSlotSelected(slot: TimeSlotViewModel, isPanelDisabled: boolean): void {
    if (isPanelDisabled || slot.isBooked || !slot.isSelectable) {
      return;
    }
    this.store.dispatch(SetAppointmentActions.selectTime({ time: { hour: slot.hour, minute: slot.minute, isBooked: slot.isBooked } }));
  }

  isStart(slot: TimeSlotViewModel, selectedStartTime: TimeSlot | null): boolean {
    return !!selectedStartTime
      && selectedStartTime.hour === slot.hour
      && selectedStartTime.minute === slot.minute;
  }

  confirmSelection(event: Event, isPanelDisabled: boolean, selectedStartTime: TimeSlot | null): void {
    event.stopPropagation();
    if (isPanelDisabled || !selectedStartTime) {
      return;
    }
    this.store.dispatch(SetAppointmentActions.openDialog());
  }
}


