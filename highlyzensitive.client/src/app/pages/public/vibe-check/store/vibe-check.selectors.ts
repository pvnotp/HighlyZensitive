import { createSelector } from '@ngrx/store';
import {
  VIBE_CHECK_DURATION_MINUTES,
  BookingStatus,
  ClientDetails,
  DialogStatus,
  TimePickerStatus,
  TimeSlot,
} from './vibe-check.state';
import { VibeCheckFeature } from './vibe-check.reducer';
import { VibeCheckUtils } from '../vibe-check.utils';
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

export interface VibeCheckViewModel {
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

function getDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// ---------------------------------------------------------------------------
// View model selectors
// ---------------------------------------------------------------------------

export const selectVibeCheckViewModel = createSelector(
  VibeCheckFeature.selectClientDetails,
  globalFeature.selectNotification,
  (clientDetails, notification): VibeCheckViewModel => ({
    isPanelDisabled: clientDetails === null,
    notification,
  }),
);

export const selectDatePickerViewModel = createSelector(
  VibeCheckFeature.selectSelectedDate,
  VibeCheckFeature.selectClientDetails,
  (selectedDate, clientDetails): DatePickerViewModel => ({
    selectedDate: selectedDate ? new Date(selectedDate) : null,
    isPanelDisabled: clientDetails === null,
  }),
);

export const selectTimePickerViewModel = createSelector(
  VibeCheckFeature.selectTimesByDate,
  VibeCheckFeature.selectSelectedTime,
  VibeCheckFeature.selectSelectedDate,
  VibeCheckFeature.selectClientDetails,
  VibeCheckFeature.selectTimePickerStatus,
  (
    timesByDate,
    selectedTime,
    selectedDate,
    clientDetails,
    timePickerStatus,
  ): TimePickerViewModel => {
    const selectedDateAsDate = selectedDate ? new Date(selectedDate) : null;
    const selectedDateKey = selectedDateAsDate ? getDateKey(selectedDateAsDate) : null;
    const times = selectedDateKey ? (timesByDate[selectedDateKey] ?? []) : [];

    const durationMinutes = VIBE_CHECK_DURATION_MINUTES;
    const slotsNeeded = Math.max(1, Math.floor(durationMinutes / 15));

    const startIndex =
      selectedTime !== null
        ? times.findIndex(
            (t) => t.hour === selectedTime.hour && t.minute === selectedTime.minute,
          )
        : -1;

    const enrichedTimes: TimeSlotViewModel[] = times.map((slot, index) => ({
      ...slot,
      label: VibeCheckUtils.formatTimeLabel(slot.hour, slot.minute),
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
      selectedDate: selectedDateAsDate,
    };
  },
);

export const selectConfirmDialogViewModel = createSelector(
  VibeCheckFeature.selectDialogStatus,
  VibeCheckFeature.selectBookingStatus,
  VibeCheckFeature.selectClientDetails,
  VibeCheckFeature.selectSelectedTime,
  VibeCheckFeature.selectSelectedDate,
  (
    dialogStatus,
    bookingStatus,
    clientDetails,
    selectedTime,
    selectedDate,
  ): ConfirmDialogViewModel => {
    const selectedDateAsDate = selectedDate ? new Date(selectedDate) : null;

    let endTime = '';
    if (selectedTime) {
      const end = addMinutes(
        selectedTime.hour,
        selectedTime.minute,
        VIBE_CHECK_DURATION_MINUTES,
      );
      endTime = VibeCheckUtils.formatTimeLabel(end.hour, end.minute);
    }

    let selectedDateText = '';
    if (selectedDateAsDate && selectedTime) {
      const startLabel = VibeCheckUtils.formatTimeLabel(selectedTime.hour, selectedTime.minute);
      selectedDateText = VibeCheckUtils.formatSelectedDateText(selectedDateAsDate, {
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
