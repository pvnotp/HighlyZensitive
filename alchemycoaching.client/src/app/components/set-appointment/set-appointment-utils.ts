interface TimeSlotLabel {
  label: string;
}

export class SetAppointmentUtils {
  static readonly appointmentDateFormatter = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });

  static isVibeCheck(type: string): boolean {
    return type.trim().toLowerCase() === 'vibe check';
  }

  static formatSelectedDateText(selectedDate: Date | null, selectedSlot: TimeSlotLabel | null): string {
    if (!selectedDate || !selectedSlot) {
      return '';
    }

    return `${SetAppointmentUtils.appointmentDateFormatter.format(selectedDate)} at ${selectedSlot.label}`;
  }
}