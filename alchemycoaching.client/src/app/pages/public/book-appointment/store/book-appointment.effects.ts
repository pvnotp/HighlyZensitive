import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { catchError, exhaustMap, map, of, switchMap, withLatestFrom } from 'rxjs';
import { EmailService } from '../../../../services/email.service';
import { CalendarEvent, CalendarService } from '../../../../services/calendar.service';
import { GlobalActions } from '../../../../global/store/global.actions';
import { BookAppointmentActions } from './book-appointment.actions';
import { BookAppointmentFeature } from './book-appointment.reducer';
import { END_HOUR, ServiceType, START_HOUR, TimeSlot } from './book-appointment.state';
import { BookAppointmentUtils } from '../book-appointment-utils';

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
export class BookAppointmentEffects {
  private readonly actions$ = inject(Actions);
  private readonly store = inject(Store);
  private readonly calendarService = inject(CalendarService); 
  private readonly emailService = inject(EmailService);
  
  loadTimes$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BookAppointmentActions.selectDate),
      switchMap(({ date }) =>
        this.calendarService.getAvailabilityForDay(new Date(date)).pipe(
          map((events) =>
            BookAppointmentActions.loadTimesSuccess({
              times: buildTimeSlotsFromEvents(new Date(date), events),
            }),
          ),
          catchError(() => of(BookAppointmentActions.loadTimesFailure())),
        ),
      ),
    ),
  );

  submitAppointment$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BookAppointmentActions.submitAppointment),
      withLatestFrom(
        this.store.select(BookAppointmentFeature.selectClientDetails),
        this.store.select(BookAppointmentFeature.selectSelectedTime),
        this.store.select(BookAppointmentFeature.selectSelectedDate),
        this.store.select(BookAppointmentFeature.selectService),
      ),
      exhaustMap(([{ note }, clientDetails, selectedTime, selectedDate, service]) => {
        if (!clientDetails || !selectedTime || !selectedDate || !service) {
          return of(
            BookAppointmentActions.submitAppointmentFailure({
              errorMessage: 'Missing booking information.',
            }),
          );
        }

        const start = new Date(selectedDate);
        start.setHours(selectedTime.hour, selectedTime.minute, 0, 0);
        const end = new Date(start);
        end.setMinutes(end.getMinutes() + service.duration);

        const summaryPrefix =
          service.type === ServiceType.VibeCheck ? 'Vibe Check' : 'Session';

        return this.calendarService
          .createEvent({
            summary: `${summaryPrefix} with ${clientDetails.name}`,
            start: start.toISOString(),
            end: end.toISOString(),
            description: note
              ? `Phone: ${clientDetails.phone}\nNote: ${note}`
              : `Phone: ${clientDetails.phone}`,
          })
          .pipe(
            map(() => BookAppointmentActions.submitAppointmentSuccess()),
            catchError(() =>
              of(
                BookAppointmentActions.submitAppointmentFailure({
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
      ofType(BookAppointmentActions.submitAppointmentSuccess),
      map(() => GlobalActions.notifyUser({ message: 'Your appointment has been confirmed!', duration: 3500, variant: 'success' })),
    ),
  );

  notifyUserAfterBookingFailure$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BookAppointmentActions.submitAppointmentFailure),
      map(({ errorMessage }) => GlobalActions.notifyUser({ message: errorMessage, duration: 4000, variant: 'warn' })),
    ),
  );

  sendConfirmationEmail$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BookAppointmentActions.submitAppointmentSuccess),
      withLatestFrom(
        this.store.select(BookAppointmentFeature.selectClientDetails), 
        this.store.select(BookAppointmentFeature.selectSelectedDate), 
        this.store.select(BookAppointmentFeature.selectSelectedTime)),
      exhaustMap(([, clientDetails, appointmentDate, appointmentTime]) => {
        if (!clientDetails?.email) return of(BookAppointmentActions.confirmationEmailComplete());
        let body = "";
        if (!appointmentDate || !appointmentTime) {
          body = `You\'re scheduled for a fifteen minute call with Samantha.`;
        } else {
          const startLabel = BookAppointmentUtils.formatTimeLabel(appointmentTime!.hour, appointmentTime!.minute);
          const formattedDate = BookAppointmentUtils.formatSelectedDateText(new Date(appointmentDate!), { label: startLabel });
          body = `You\'re scheduled for a fifteen minute call with Samantha on ${formattedDate}.`;
        }

        return this.emailService.sendEmail({
          from: 'alisonjoyforster@gmail.com',
          to: clientDetails.email,
          subject: 'Thank you for booking your appointment!',
          body: body + " I look forward to connecting with you! If you have any questions ahead of time feel free to reply to this email.",
        }).pipe(
          catchError(() => of(null)),
          map(() => BookAppointmentActions.confirmationEmailComplete())
        );
      })
    )
  );

  reloadTimesAfterBooking$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BookAppointmentActions.confirmationEmailComplete),
      withLatestFrom(this.store.select(BookAppointmentFeature.selectSelectedDate)),
      map(([, selectedDate]) =>
        selectedDate
          ? BookAppointmentActions.selectDate({ date: selectedDate })
          : BookAppointmentActions.loadTimesFailure(),
      ),
    ),
  );

}
