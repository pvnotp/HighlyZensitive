import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-date-picker',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './date-picker.component.html',
  styleUrl: './date-picker.component.scss'
})
export class DatePickerComponent {
  readonly weekdayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  readonly today = this.atMidnight(new Date());
  readonly tomorrow = (() => {
    const date = new Date(this.today);
    date.setDate(date.getDate() + 1);
    return date;
  })();
  readonly weeks = this.buildNextSixWeeks();
  readonly rangeLabel = this.buildRangeLabel();

  selectedDate = this.tomorrow;

  @Output() readonly dateSelected = new EventEmitter<Date>();

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

  private buildRangeLabel(): string {
    const firstDay = this.weeks[0][0];
    const lastDay = this.weeks[this.weeks.length - 1][6];

    const firstMonth = firstDay.toLocaleString(undefined, { month: 'long' });
    const lastMonth = lastDay.toLocaleString(undefined, { month: 'long' });
    const lastYear = lastDay.getFullYear();

    if (firstDay.getMonth() === lastDay.getMonth()) {
      return `${firstMonth} ${lastYear}`;
    }

    return `${firstMonth} - ${lastMonth} ${lastYear}`;
  }

  selectDate(date: Date): void {
    this.selectedDate = this.atMidnight(date);
    this.dateSelected.emit(this.selectedDate);
  }

  isSelected(date: Date): boolean {
    return this.atMidnight(date).getTime() === this.selectedDate.getTime();
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