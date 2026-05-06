import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { ClientDetails, Service, TimeSlot } from './book-appointment.state';

export const BookAppointmentActions = createActionGroup({
  source: 'BookAppointment',
  events: {
    'Update Service': props<{ service: Service }>(),
    'Set Client Details': props<{ clientDetails: ClientDetails }>(),
    'Clear Details': emptyProps(),
    'Select Date': props<{ date: string }>(),
    'Select Time': props<{ time: TimeSlot }>(),
    'Load Times Success': props<{ times: TimeSlot[] }>(),
    'Load Times Failure': emptyProps(),
    'Open Dialog': emptyProps(),
    'Close Dialog': emptyProps(),
    'Submit Appointment': props<{ note: string }>(),
    'Submit Appointment Success': emptyProps(),
    'Submit Appointment Failure': props<{ errorMessage: string }>(),
    'Confirmation Email Complete': emptyProps(),
  },
});
