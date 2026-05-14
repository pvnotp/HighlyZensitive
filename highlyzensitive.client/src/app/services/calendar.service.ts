import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CalendarEvent {
  id: string;
  summary: string;
  start: string;
  end: string;
  description?: string;
  location?: string;
  isAllDay: boolean;
  status: string;
}

export interface CreateCalendarEventRequest {
  summary: string;
  start: string;
  end: string;
  description: string;
  location?: string;
}

export enum Calendar {
  Appointments,
  Events
}

@Injectable({ providedIn: 'root' })
export class CalendarService {
  private readonly http = inject(HttpClient);

  getCalendarForRange(calendar: Calendar, from: Date, to: Date): Observable<CalendarEvent[]> {
    return this.http.get<CalendarEvent[]>('/calendar/events', {
      params: {
        calendar: calendar,
        from: from.toISOString(),
        to: to.toISOString()
      }
    });
  }

  getCalendarForDay(calendar: Calendar, date: Date): Observable<CalendarEvent[]> {
    const from = new Date(date);
    from.setHours(0, 0, 0, 0);

    const to = new Date(date);
    to.setHours(23, 59, 59, 999);

    return this.getCalendarForRange(calendar, from, to);
  }

  getUpcomingEvents(): Observable<CalendarEvent[]> {
    const now = new Date();
    const from = new Date(now);
    from.setHours(0, 0, 0, 0);

    const to = new Date(now);
    to.setDate(to.getDate() + 30); // Fetch events for the next 30 days
    to.setHours(23, 59, 59, 999);

    return this.http.get<CalendarEvent[]>('/calendar/events', {
      params: {
        calendar: Calendar.Events,
        from: from.toISOString(),
        to: to.toISOString()
      }
    });
  }

  createEvent(request: CreateCalendarEventRequest): Observable<CalendarEvent> {
    return this.http.post<CalendarEvent>('/calendar/events', request);
  }
}
