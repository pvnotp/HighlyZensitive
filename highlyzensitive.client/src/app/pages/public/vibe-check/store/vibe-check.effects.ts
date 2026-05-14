import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { catchError, exhaustMap, forkJoin, map, of, withLatestFrom } from 'rxjs';
import { EmailService } from '../../../../services/email.service';
import { Calendar, CalendarEvent, CalendarService } from '../../../../services/calendar.service';
import { GlobalActions } from '../../../../global/store/global.actions';
import { VibeCheckActions } from './vibe-check.actions';
import { VibeCheckFeature } from './vibe-check.reducer';
import { END_HOUR, START_HOUR, TimeSlot, VIBE_CHECK_DURATION_MINUTES } from './vibe-check.state';
import { VibeCheckUtils } from '../vibe-check.utils';

const AVAILABILITY_PRELOAD_DAYS = 42;

function atMidnight(date: Date): Date {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function startOfWeek(date: Date): Date {
  const copy = atMidnight(date);
  copy.setDate(copy.getDate() - copy.getDay());
  return copy;
}

function addDays(date: Date, days: number): Date {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

function getDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function buildTimesByDate(
  rangeStart: Date,
  numberOfDays: number,
  events: CalendarEvent[],
): Record<string, TimeSlot[]> {
  const timesByDate: Record<string, TimeSlot[]> = {};

  for (let offset = 0; offset < numberOfDays; offset++) {
    const date = addDays(rangeStart, offset);
    timesByDate[getDateKey(date)] = buildTimeSlotsFromEvents(date, events);
  }

  return timesByDate;
}

function buildTimeSlotsFromEvents(date: Date, events: CalendarEvent[]): TimeSlot[] {
  const slots: TimeSlot[] = [];
  const now = new Date();
  const cutoff = new Date(now.getTime() + 6 * 60 * 60 * 1000);
  const isToday = date.toDateString() === now.toDateString();
  const isCutoffDay = date.toDateString() === cutoff.toDateString();

  for (let hour = START_HOUR; hour < END_HOUR; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      const slotStart = new Date(date);
      slotStart.setHours(hour, minute, 0, 0);

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

      slots.push({ hour, minute, isBooked });
    }
  }

  return slots;
}

@Injectable()
export class VibeCheckEffects {
  private readonly actions$ = inject(Actions);
  private readonly store = inject(Store);
  private readonly calendarService = inject(CalendarService); 
  private readonly emailService = inject(EmailService);
  
  loadAvailability$ = createEffect(() =>
    this.actions$.pipe(
      ofType(VibeCheckActions.loadAvailability),
      exhaustMap(() => {
        const rangeStart = startOfWeek(new Date());
        const rangeEnd = addDays(rangeStart, AVAILABILITY_PRELOAD_DAYS - 1);
        rangeEnd.setHours(23, 59, 59, 999);

        return forkJoin({
          appointmentEvents: this.calendarService.getCalendarForRange(
            Calendar.Appointments,
            rangeStart,
            rangeEnd,
          ),
          eventCalendarEvents: this.calendarService.getCalendarForRange(
            Calendar.Events,
            rangeStart,
            rangeEnd,
          ),
        }).pipe(
          map(({ appointmentEvents, eventCalendarEvents }) =>
            VibeCheckActions.loadAvailabilitySuccess({
              timesByDate: buildTimesByDate(
                rangeStart,
                AVAILABILITY_PRELOAD_DAYS,
                [...appointmentEvents, ...eventCalendarEvents],
              ),
            }),
          ),
          catchError(() => of(VibeCheckActions.loadAvailabilityFailure())),
        );
      }),
    ),
  );

  submitAppointment$ = createEffect(() =>
    this.actions$.pipe(
      ofType(VibeCheckActions.submitAppointment),
      withLatestFrom(
        this.store.select(VibeCheckFeature.selectClientDetails),
        this.store.select(VibeCheckFeature.selectSelectedTime),
        this.store.select(VibeCheckFeature.selectSelectedDate),
      ),
      exhaustMap(([{ note }, clientDetails, selectedTime, selectedDate]) => {
        if (!clientDetails || !selectedTime || !selectedDate) {
          return of(
            VibeCheckActions.submitAppointmentFailure({
              errorMessage: 'Missing booking information.',
            }),
          );
        }

        const start = new Date(selectedDate);
        start.setHours(selectedTime.hour, selectedTime.minute, 0, 0);
        const end = new Date(start);
        end.setMinutes(end.getMinutes() + VIBE_CHECK_DURATION_MINUTES);

        return this.calendarService
          .createEvent({
            summary: `Vibe Check with ${clientDetails.name}`,
            start: start.toISOString(),
            end: end.toISOString(),
            description: note
              ? `Phone: ${clientDetails.phone}\nNote: ${note}`
              : `Phone: ${clientDetails.phone}`,
          })
          .pipe(
            map(() => VibeCheckActions.submitAppointmentSuccess()),
            catchError(() =>
              of(
                VibeCheckActions.submitAppointmentFailure({
                  errorMessage: 'Could not confirm the appointment. Please try again.',
                }),
              ),
            ),
          );
      }),
    ),
  );

  notifyUserAfterBookingSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(VibeCheckActions.submitAppointmentSuccess),
      map(() => GlobalActions.notifyUser({ message: 'Your appointment has been confirmed!', duration: 3500, variant: 'success' })),
    ),
  );

  notifyUserAfterBookingFailure$ = createEffect(() =>
    this.actions$.pipe(
      ofType(VibeCheckActions.submitAppointmentFailure),
      map(({ errorMessage }) => GlobalActions.notifyUser({ message: errorMessage, duration: 4000, variant: 'warn' })),
    ),
  );

  sendConfirmationEmail$ = createEffect(() =>
    this.actions$.pipe(
      ofType(VibeCheckActions.submitAppointmentSuccess),
      withLatestFrom(
        this.store.select(VibeCheckFeature.selectClientDetails), 
        this.store.select(VibeCheckFeature.selectSelectedDate), 
        this.store.select(VibeCheckFeature.selectSelectedTime)),
      exhaustMap(([, clientDetails, appointmentDate, appointmentTime]) => {
        if (!clientDetails?.email) return of(VibeCheckActions.confirmationEmailComplete());
        let body = "";
        const startLabel = VibeCheckUtils.formatTimeLabel(appointmentTime!.hour, appointmentTime!.minute);
        const formattedDate = VibeCheckUtils.formatSelectedDateText(new Date(appointmentDate!), { label: startLabel });
        body = `You\'re scheduled for a fifteen minute call with Samantha on ${formattedDate}.   
          I look forward to connecting with you! If you have any questions ahead of time feel free to reply to this email.`;
        return this.emailService.sendEmail({
          to: clientDetails.email,
          subject: 'Thank you for booking your appointment!',
          body: body
        }).pipe(
          catchError(() => of(null)),
          map(() => VibeCheckActions.confirmationEmailComplete())
        );
      })
    )
  );

  reloadTimesAfterBooking$ = createEffect(() =>
    this.actions$.pipe(
      ofType(VibeCheckActions.confirmationEmailComplete),
      map(() => VibeCheckActions.loadAvailability()),
    ),
  );

}
