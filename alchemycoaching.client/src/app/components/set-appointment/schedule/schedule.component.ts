import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ConfirmAppointmentComponent } from '../confirm-appointment/confirm-appointment.component';
import { DatePickerComponent } from '../date-picker/date-picker.component';
import { TimePickerComponent, TimeSlot } from '../time-picker/time-picker.component';

@Component({
  selector: 'app-schedule',
  standalone: true,
  imports: [DatePickerComponent, TimePickerComponent, ConfirmAppointmentComponent],
  templateUrl: './schedule.component.html',
  styleUrl: './schedule.component.scss'
})
export class ScheduleComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);

  @ViewChild(TimePickerComponent) private readonly timePicker?: TimePickerComponent;

  type = '';
  duration = '';
  selectedDate = (() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; })();
  selectedSlot: TimeSlot | null = null;
  isDialogOpen = false;

  onDateSelected(date: Date): void {
    this.selectedDate = date;
    this.closeDialog();
  }

  openAppointmentDialog(slot: TimeSlot): void {
    this.selectedSlot = slot;
    this.isDialogOpen = true;
  }

  closeDialog(): void {
    this.isDialogOpen = false;
    this.selectedSlot = null;
  }

  onAppointmentCreated(): void {
    this.closeDialog();
    this.timePicker?.refreshAvailability();
  }

  get titleText(): string {
    const normalizedType = this.type.trim().toLowerCase();

    if (normalizedType === 'vibe check') {
      return 'Schedule a vibe check';
    }

    return 'Schedule a session';
  }

  get contentText(): string {
    const normalizedType = this.type.trim().toLowerCase();

    if (normalizedType === 'vibe check') {
      return "Let's chat!  It's already written in the stars that we would meet.  Pick your time and fulfill the prophesy. ★";
    }

    return 'Choose a session type to see the scheduling details.';
  }

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      this.type = params.get('type') ?? '';
      this.duration = params.get('duration') ?? '';
    });
  }
}
