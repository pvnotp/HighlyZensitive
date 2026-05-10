import { Component, OnInit } from '@angular/core';
import { CalendarService, CalendarEvent } from '../../../services/calendar.service';
import { DatePipe, NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './events.component.html',
  styleUrl: './events.component.scss'
})
export class EventsComponent implements OnInit {
  events: CalendarEvent[] = [];
  loading = true;
  error: string | null = null;

  constructor(private calendarService: CalendarService) {}

  ngOnInit(): void {
    this.calendarService.getUpcomingEvents().subscribe({
      next: (events) => {
        this.events = events;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load events.';
        this.loading = false;
      }
    });
  }
}
