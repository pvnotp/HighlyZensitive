import { createFeature, createReducer, on } from '@ngrx/store';
import { SetAppointmentActions } from './set-appointment.actions';
import { BookingStatus, DialogStatus, initialState, TimePickerStatus } from './set-appointment.state';

const reducer = createReducer(
  initialState,

  on(SetAppointmentActions.updateService, (state, { service }) => ({
    ...state,
    service,
  })),

  on(SetAppointmentActions.setClientDetails, (state, { clientDetails }) => ({
    ...state,
    clientDetails,
  })),

  on(SetAppointmentActions.clearDetails, (state) => ({
    ...state,
    clientDetails: null,
    selectedTime: null,
    dialogStatus: DialogStatus.Closed,
    bookingStatus: null,
  })),

  on(SetAppointmentActions.selectDate, (state, { date }) => ({
    ...state,
    selectedDate: date,
    selectedTime: null,
    timePickerStatus: { status: TimePickerStatus.Loading },
  })),

  on(SetAppointmentActions.selectTime, (state, { time }) => ({
    ...state,
    selectedTime: time,
  })),

  on(SetAppointmentActions.loadTimesSuccess, (state, { times }) => ({
    ...state,
    times,
    timePickerStatus: { status: TimePickerStatus.Loaded },
  })),

  on(SetAppointmentActions.loadTimesFailure, (state) => ({
    ...state,
    timePickerStatus: {
      status: TimePickerStatus.Error,
      errorMessage: 'Could not load available times.',
    },
  })),

  on(SetAppointmentActions.openDialog, (state) => ({
    ...state,
    dialogStatus: DialogStatus.Open,
    bookingStatus: null,
  })),

  on(SetAppointmentActions.closeDialog, (state) => ({
    ...state,
    dialogStatus: DialogStatus.Closed,
    selectedTime: null,
    bookingStatus: null,
  })),

  on(SetAppointmentActions.submitAppointment, (state) => ({
    ...state,
    bookingStatus: { status: BookingStatus.Submitting },
  })),

  on(SetAppointmentActions.submitAppointmentSuccess, (state) => ({
    ...state,
    dialogStatus: DialogStatus.Closed,
    selectedTime: null,
    bookingStatus: { status: BookingStatus.Submitted },
  })),

  on(SetAppointmentActions.submitAppointmentFailure, (state, { errorMessage }) => ({
    ...state,
    bookingStatus: { status: BookingStatus.Error, errorMessage },
  })),
);

export const setAppointmentFeature = createFeature({
  name: 'setAppointment',
  reducer,
});
