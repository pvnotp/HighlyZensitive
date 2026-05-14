import { createFeature, createReducer, on } from '@ngrx/store';
import { VibeCheckActions as VibeCheckActions } from './vibe-check.actions';
import { BookingStatus, DialogStatus, initialState, TimePickerStatus } from './vibe-check.state';

const reducer = createReducer(
  initialState,

  on(VibeCheckActions.setClientDetails, (state, { clientDetails }) => ({
    ...state,
    clientDetails,
  })),

  on(VibeCheckActions.clearDetails, (state) => ({
    ...state,
    clientDetails: null,
    selectedTime: null,
    dialogStatus: DialogStatus.Closed,
    bookingStatus: null,
  })),

  on(VibeCheckActions.selectDate, (state, { date }) => ({
    ...state,
    selectedDate: date,
    selectedTime: null,
    timePickerStatus: { status: TimePickerStatus.Loading },
  })),

  on(VibeCheckActions.selectTime, (state, { time }) => ({
    ...state,
    selectedTime: time,
  })),

  on(VibeCheckActions.loadTimesSuccess, (state, { times }) => ({
    ...state,
    times,
    timePickerStatus: { status: TimePickerStatus.Loaded },
  })),

  on(VibeCheckActions.loadTimesFailure, (state) => ({
    ...state,
    timePickerStatus: {
      status: TimePickerStatus.Error,
      errorMessage: 'Could not load available times.',
    },
  })),

  on(VibeCheckActions.openDialog, (state) => ({
    ...state,
    dialogStatus: DialogStatus.Open,
    bookingStatus: null,
  })),

  on(VibeCheckActions.closeDialog, (state) => ({
    ...state,
    dialogStatus: DialogStatus.Closed,
    selectedTime: null,
    bookingStatus: null,
  })),

  on(VibeCheckActions.submitAppointment, (state) => ({
    ...state,
    bookingStatus: { status: BookingStatus.Submitting },
  })),

  on(VibeCheckActions.submitAppointmentSuccess, (state) => ({
    ...state,
    dialogStatus: DialogStatus.Closed,
    bookingStatus: { status: BookingStatus.Submitted },
  })),

  on(VibeCheckActions.submitAppointmentFailure, (state, { errorMessage }) => ({
    ...state,
    dialogStatus: DialogStatus.Closed,
    bookingStatus: { status: BookingStatus.Error, errorMessage },
  })),

  on(VibeCheckActions.confirmationEmailComplete, (state) => ({
    ...state,
    selectedTime: null
  })),
);

export const VibeCheckFeature = createFeature({
  name: 'VibeCheck',
  reducer,
});
