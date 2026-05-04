import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalendarService, CalendarEvent } from '../../../services/calendar.service';

export interface TimeSlot {
  hour: number;
  minute: number;
  label: string;
  isHourMark: boolean;
  isBooked: boolean;
}

@Component({
  selector: 'app-time-picker',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './time-picker.component.html',
  styleUrl: './time-picker.component.scss'
})
export class TimePickerComponent implements OnChanges {
  @Input() selectedDate: Date | null = null;
  @Output() confirmRequested = new EventEmitter<TimeSlot>();

  private readonly calendarService = inject(CalendarService);

  readonly START_HOUR = 11;
  readonly END_HOUR = 21;

  slots: TimeSlot[] = [];
  isLoading = false;
  hasError = false;
  selectedSlotKey: string | null = null;

  onSlotSelected(slot: TimeSlot): void {
    if (slot.isBooked) {
      return;
    }

    this.selectedSlotKey = this.getSlotKey(slot);
  }

  isSelected(slot: TimeSlot): boolean {
    return this.selectedSlotKey === this.getSlotKey(slot);
  }

  confirmSelection(event: Event): void {
    event.stopPropagation();

    if (!this.selectedSlot) {
      return;
    }

    this.confirmRequested.emit(this.selectedSlot);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedDate'] && this.selectedDate) {
      this.loadEvents(this.selectedDate);
    }
  }

  private loadEvents(date: Date): void {
    this.isLoading = true;
    this.hasError = false;
    this.selectedSlotKey = null;

    this.calendarService.getEventsForDay(date).subscribe({
      next: (events) => {
        this.slots = this.buildSlots(date, events);
        this.isLoading = false;
      },
      error: () => {
        this.hasError = true;
        this.isLoading = false;
      }
    });
  }

  refreshAvailability(): void {
    if (!this.selectedDate) {
      return;
    }

    this.loadEvents(this.selectedDate);
  }

  private buildSlots(date: Date, events: CalendarEvent[]): TimeSlot[] {
    const slots: TimeSlot[] = [];
    const now = new Date();
    const cutoff = new Date(now.getTime() + 6 * 60 * 60 * 1000);
    const isToday = date.toDateString() === now.toDateString();
    const isCutoffDay = date.toDateString() === cutoff.toDateString();

    for (let hour = this.START_HOUR; hour < this.END_HOUR; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const slotStart = new Date(date);
        slotStart.setHours(hour, minute, 0, 0);

        // Skip slots within 6 hours from now
        if ((isToday || isCutoffDay) && slotStart <= cutoff) {
          continue;
        }

        const slotEnd = new Date(slotStart);
        slotEnd.setMinutes(slotEnd.getMinutes() + 15);

        const isBooked = events.some((e) => {
          if (e.isAllDay) return false;
          const eventStart = new Date(e.start);
          const eventEnd = new Date(e.end);
          return eventStart < slotEnd && eventEnd > slotStart;
        });

        const displayHour = hour % 12 === 0 ? 12 : hour % 12;
        const amPm = hour < 12 ? 'AM' : 'PM';
        const label =
          minute === 0
            ? `${displayHour}:00 ${amPm}`
            : `${displayHour}:${minute.toString().padStart(2, '0')}`;

        slots.push({ hour, minute, label, isHourMark: minute === 0, isBooked });
      }
    }

    return slots;
  }

  private getSlotKey(slot: TimeSlot): string {
    return `${slot.hour}-${slot.minute}`;
  }

  get selectedSlot(): TimeSlot | null {
    return this.slots.find((slot) => this.getSlotKey(slot) === this.selectedSlotKey) ?? null;
  }

  get noTimesAvailable(): boolean {
    if (!this.selectedDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dateOnly = new Date(this.selectedDate);
    dateOnly.setHours(0, 0, 0, 0);
    if (dateOnly < today) return true;
    // Check if all slots on this day fall within the 6-hour cutoff
    const cutoff = new Date(Date.now() + 6 * 60 * 60 * 1000);
    const lastSlot = new Date(this.selectedDate);
    lastSlot.setHours(this.END_HOUR - 1, 45, 0, 0);
    return lastSlot <= cutoff;
  }
}
