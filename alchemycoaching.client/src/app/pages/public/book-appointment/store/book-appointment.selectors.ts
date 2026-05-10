import { createSelector } from '@ngrx/store';
import {
  BookingStatus,
  ClientDetails,
  DialogStatus,
  Service,
  ServiceType,
  TimePickerStatus,
  TimeSlot,
} from './book-appointment.state';
import { BookAppointmentFeature } from './book-appointment.reducer';
import { BookAppointmentUtils } from '../book-appointment-utils';
import { globalFeature } from '../../../../global/store/global.reducer';
import { NotificationState } from '../../../../global/store/global.state';

// ---------------------------------------------------------------------------
// View model interfaces
// ---------------------------------------------------------------------------

export interface TimeSlotViewModel {
  hour: number;
  minute: number;
  isBooked: boolean;
  label: string;
  isHourMark: boolean;
  isStart: boolean;
  isInRange: boolean;
  isSelectable: boolean;
}

export interface SchedulerViewModel {
  titleText: string;
  contentText: string;
  service: Service | null;
  isPanelDisabled: boolean;
  notification: NotificationState;
}

export interface DatePickerViewModel {
  selectedDate: Date | null;
  isPanelDisabled: boolean;
}

export interface TimePickerViewModel {
  times: TimeSlotViewModel[];
  selectedStartTime: TimeSlot | null;
  timePickerStatus: { status: TimePickerStatus; errorMessage?: string } | null;
  isPanelDisabled: boolean;
  selectedDate: Date | null;
}

export interface ConfirmDialogViewModel {
  dialogStatus: DialogStatus;
  bookingStatus: { status: BookingStatus; errorMessage?: string } | null;
  clientDetails: ClientDetails | null;
  selectedStartTime: TimeSlot | null;
  endTime: string;
  selectedDateText: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------



function addMinutes(
  hour: number,
  minute: number,
  durationMinutes: number,
): { hour: number; minute: number } {
  const total = hour * 60 + minute + durationMinutes;
  return { hour: Math.floor(total / 60), minute: total % 60 };
}

function isSlotSelectable(
  slotIndex: number,
  times: TimeSlot[],
  slotsNeeded: number,
): boolean {
  if (slotIndex + slotsNeeded > times.length) return false;
  for (let i = slotIndex; i < slotIndex + slotsNeeded; i++) {
    if (times[i].isBooked) return false;
  }
  return true;
}

// ---------------------------------------------------------------------------
// View model selectors
// ---------------------------------------------------------------------------

export const selectSchedulerViewModel = createSelector(
  BookAppointmentFeature.selectService,
  BookAppointmentFeature.selectClientDetails,
  globalFeature.selectNotification,
  (service, clientDetails, notification): SchedulerViewModel => {
    const isVibeCheck = service?.type === ServiceType.VibeCheck;
    return {
      titleText: isVibeCheck ? 'Get a vibe check' : 'Schedule a session',
      contentText: isVibeCheck
        ? "Let's chat!  It's already written in the stars that we would meet.  Pick your time and fulfill the prophesy."
        : 'Choose a session type to see the scheduling details.',
      service,
      isPanelDisabled: clientDetails === null,
      notification,
    };
  },
);

export const selectDatePickerViewModel = createSelector(
  BookAppointmentFeature.selectSelectedDate,
  BookAppointmentFeature.selectClientDetails,
  (selectedDate, clientDetails): DatePickerViewModel => ({
    selectedDate: selectedDate ? new Date(selectedDate) : null,
    isPanelDisabled: clientDetails === null,
  }),
);

export const selectTimePickerViewModel = createSelector(
  BookAppointmentFeature.selectTimes,
  BookAppointmentFeature.selectSelectedTime,
  BookAppointmentFeature.selectSelectedDate,
  BookAppointmentFeature.selectClientDetails,
  BookAppointmentFeature.selectTimePickerStatus,
  BookAppointmentFeature.selectService,
  (
    times,
    selectedTime,
    selectedDate,
    clientDetails,
    timePickerStatus,
    service,
  ): TimePickerViewModel => {
    const durationMinutes = service?.duration ?? 15;
    const slotsNeeded = Math.max(1, Math.floor(durationMinutes / 15));

    const startIndex =
      selectedTime !== null
        ? times.findIndex(
            (t) => t.hour === selectedTime.hour && t.minute === selectedTime.minute,
          )
        : -1;

    const enrichedTimes: TimeSlotViewModel[] = times.map((slot, index) => ({
      ...slot,
      label: BookAppointmentUtils.formatTimeLabel(slot.hour, slot.minute),
      isHourMark: slot.minute === 0,
      isStart: index === startIndex,
      isInRange: startIndex !== -1 && index >= startIndex && index < startIndex + slotsNeeded,
      isSelectable: !slot.isBooked && isSlotSelectable(index, times, slotsNeeded),
    }));

    return {
      times: enrichedTimes,
      selectedStartTime: selectedTime,
      timePickerStatus,
      isPanelDisabled: clientDetails === null,
      selectedDate: selectedDate ? new Date(selectedDate) : null,
    };
  },
);

export const selectConfirmDialogViewModel = createSelector(
  BookAppointmentFeature.selectDialogStatus,
  BookAppointmentFeature.selectBookingStatus,
  BookAppointmentFeature.selectClientDetails,
  BookAppointmentFeature.selectSelectedTime,
  BookAppointmentFeature.selectSelectedDate,
  BookAppointmentFeature.selectService,
  (
    dialogStatus,
    bookingStatus,
    clientDetails,
    selectedTime,
    selectedDate,
    service,
  ): ConfirmDialogViewModel => {
    const selectedDateAsDate = selectedDate ? new Date(selectedDate) : null;

    let endTime = '';
    if (selectedTime && service) {
      const end = addMinutes(selectedTime.hour, selectedTime.minute, service.duration);
      endTime = BookAppointmentUtils.formatTimeLabel(end.hour, end.minute);
    }

    let selectedDateText = '';
    if (selectedDateAsDate && selectedTime) {
      const startLabel = BookAppointmentUtils.formatTimeLabel(selectedTime.hour, selectedTime.minute);
      selectedDateText = BookAppointmentUtils.formatSelectedDateText(selectedDateAsDate, {
        label: startLabel,
      });
    }

    return {
      dialogStatus,
      bookingStatus,
      clientDetails,
      selectedStartTime: selectedTime,
      endTime,
      selectedDateText,
    };
  },
);
