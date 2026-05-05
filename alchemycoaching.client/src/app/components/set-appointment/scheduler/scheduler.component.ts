import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ConfirmAppointmentComponent } from '../confirm-appointment/confirm-appointment.component';
import { DatePickerComponent } from '../date-picker/date-picker.component';
import { TimePickerComponent, TimeSlot } from '../time-picker/time-picker.component';
import { SetAppointmentUtils } from '../set-appointment-utils';

@Component({
  selector: 'app-scheduler',
  standalone: true,
  imports: [DatePickerComponent, TimePickerComponent, ConfirmAppointmentComponent],
  templateUrl: './scheduler.component.html',
  styleUrl: './scheduler.component.scss'
})
export class SchedulerComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);

  @ViewChild(TimePickerComponent) private readonly timePicker?: TimePickerComponent;

  type = '';
  duration = '';
  isVibeCheck = false;
  titleText = 'Schedule a session';
  contentText = 'Choose a session type to see the scheduling details.';
  selectedDate = (() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 1);
    return d;
  })();
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

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      this.type = params.get('type') ?? '';
      this.duration = params.get('duration') ?? '';
      this.isVibeCheck = SetAppointmentUtils.isVibeCheck(this.type);
      this.titleText = this.isVibeCheck ? 'Get a vibe check' : 'Schedule a session';
      this.contentText = this.isVibeCheck
        ? "Let's chat!  It's already written in the stars that we would meet.  Pick your time and fulfill the prophesy. ★"
        : 'Choose a session type to see the scheduling details.';
    });
  }
}
