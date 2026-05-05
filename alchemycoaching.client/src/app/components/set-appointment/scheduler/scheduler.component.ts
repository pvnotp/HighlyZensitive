import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ConfirmAppointmentComponent } from '../confirm-appointment/confirm-appointment.component';
import { ClientDetailsComponent } from '../client-details/client-details.component';
import { DatePickerComponent } from '../date-picker/date-picker.component';
import { TimePickerComponent, TimeSlot } from '../time-picker/time-picker.component';
import { SetAppointmentUtils } from '../set-appointment-utils';

@Component({
  selector: 'app-scheduler',
  standalone: true,
  imports: [DatePickerComponent, TimePickerComponent, ConfirmAppointmentComponent, ClientDetailsComponent],
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
  contentEndingText = '';
  contactName = '';
  contactEmail = '';
  contactPhone = '';
  selectedDate = (() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 1);
    return d;
  })();
  selectedSlot: TimeSlot | null = null;
  isDialogOpen = false;

  get isPickerDisabled(): boolean {
    return !this.contactName.trim() || !this.contactEmail.trim() || !this.contactPhone.trim();
  }

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

  onContactFieldChanged(): void {
    if (this.isPickerDisabled) {
      this.closeDialog();
      this.timePicker?.clearSelection();
    }
  }

  onContactNameChanged(value: string): void {
    this.contactName = value;
    this.onContactFieldChanged();
  }

  onContactEmailChanged(value: string): void {
    this.contactEmail = value;
    this.onContactFieldChanged();
  }

  onContactPhoneChanged(value: string): void {
    this.contactPhone = value;
    this.onContactFieldChanged();
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
        ? "Let's chat!  It's already written in the stars that we would meet.  Pick your time and fulfill"
        : 'Choose a session type to see the scheduling details.';
      this.contentEndingText = this.isVibeCheck ? 'the prophesy. ★' : '';
    });
  }
}
