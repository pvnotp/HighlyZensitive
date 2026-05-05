import { AsyncPipe, DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { BookAppointmentActions } from '../store/book-appointment.actions';
import { selectDatePickerViewModel } from '../store/book-appointment.selectors';

@Component({
  selector: 'app-date-picker',
  standalone: true,
  imports: [AsyncPipe, DatePipe],
  templateUrl: './date-picker.component.html',
  styleUrl: './date-picker.component.scss'
})
export class DatePickerComponent {
  private readonly store = inject(Store);

  readonly weekdayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  readonly today = this.atMidnight(new Date());
  readonly weeks = this.buildNextSixWeeks();

  readonly vm$ = this.store.select(selectDatePickerViewModel);

  private buildNextSixWeeks(): Date[][] {
    const start = this.startOfWeek(this.today);
    const days = Array.from({ length: 42 }, (_, index) => {
      const date = new Date(start);
      date.setDate(start.getDate() + index);
      return date;
    });

    const weeks: Date[][] = [];
    for (let weekIndex = 0; weekIndex < 6; weekIndex++) {
      weeks.push(days.slice(weekIndex * 7, weekIndex * 7 + 7));
    }
    return weeks;
  }

  selectDate(date: Date, isPanelDisabled: boolean): void {
    if (isPanelDisabled) {
      return;
    }
    const midnight = this.atMidnight(date);
    this.store.dispatch(BookAppointmentActions.selectDate({ date: midnight.toISOString() }));
  }

  isSelected(date: Date, selectedDate: Date | null): boolean {
    if (!selectedDate) return false;
    return this.atMidnight(date).getTime() === selectedDate.getTime();
  }

  isOutsideCurrentMonth(date: Date): boolean {
    return date.getMonth() !== this.today.getMonth();
  }

  private startOfWeek(date: Date): Date {
    const copy = new Date(date);
    copy.setDate(date.getDate() - date.getDay());
    return this.atMidnight(copy);
  }

  private atMidnight(date: Date): Date {
    const copy = new Date(date);
    copy.setHours(0, 0, 0, 0);
    return copy;
  }
}