import { createFeature, createReducer, on } from '@ngrx/store';
import { BookAppointmentActions as BookAppointmentActions } from './book-appointment.actions';
import { BookingStatus, DialogStatus, initialState, TimePickerStatus } from './book-appointment.state';

const reducer = createReducer(
  initialState,

  on(BookAppointmentActions.updateService, (state, { service }) => ({
    ...state,
    service,
  })),

  on(BookAppointmentActions.setClientDetails, (state, { clientDetails }) => ({
    ...state,
    clientDetails,
  })),

  on(BookAppointmentActions.clearDetails, (state) => ({
    ...state,
    clientDetails: null,
    selectedTime: null,
    dialogStatus: DialogStatus.Closed,
    bookingStatus: null,
  })),

  on(BookAppointmentActions.selectDate, (state, { date }) => ({
    ...state,
    selectedDate: date,
    selectedTime: null,
    timePickerStatus: { status: TimePickerStatus.Loading },
  })),

  on(BookAppointmentActions.selectTime, (state, { time }) => ({
    ...state,
    selectedTime: time,
  })),

  on(BookAppointmentActions.loadTimesSuccess, (state, { times }) => ({
    ...state,
    times,
    timePickerStatus: { status: TimePickerStatus.Loaded },
  })),

  on(BookAppointmentActions.loadTimesFailure, (state) => ({
    ...state,
    timePickerStatus: {
      status: TimePickerStatus.Error,
      errorMessage: 'Could not load available times.',
    },
  })),

  on(BookAppointmentActions.openDialog, (state) => ({
    ...state,
    dialogStatus: DialogStatus.Open,
    bookingStatus: null,
  })),

  on(BookAppointmentActions.closeDialog, (state) => ({
    ...state,
    dialogStatus: DialogStatus.Closed,
    selectedTime: null,
    bookingStatus: null,
  })),

  on(BookAppointmentActions.submitAppointment, (state) => ({
    ...state,
    bookingStatus: { status: BookingStatus.Submitting },
  })),

  on(BookAppointmentActions.submitAppointmentSuccess, (state) => ({
    ...state,
    dialogStatus: DialogStatus.Closed,
    bookingStatus: { status: BookingStatus.Submitted },
  })),

  on(BookAppointmentActions.submitAppointmentFailure, (state, { errorMessage }) => ({
    ...state,
    dialogStatus: DialogStatus.Closed,
    bookingStatus: { status: BookingStatus.Error, errorMessage },
  })),

  on(BookAppointmentActions.confirmationEmailComplete, (state) => ({
    ...state,
    selectedTime: null
  })),
);

export const BookAppointmentFeature = createFeature({
  name: 'bookAppointment',
  reducer,
});
