interface TimeSlotLabel {
  label: string;
}

export class SetAppointmentUtils {
  static readonly appointmentDateFormatter = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });

  static formatSelectedDateText(selectedDate: Date | null, selectedSlot: TimeSlotLabel | null): string {
    if (!selectedDate || !selectedSlot) {
      return '';
    }

    return `${SetAppointmentUtils.appointmentDateFormatter.format(selectedDate)} at ${selectedSlot.label}`;
  }
}